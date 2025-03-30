<?php

namespace App\Http\Controllers;

use App\Models\Appointments;
use App\Models\Payments;
use App\Models\Service;
use App\Models\Patients;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class PaymentsController extends Controller
{
    public function show($appointmentId)
    {
        try {
            $user = auth()->user();
            if (!$user) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }

            $patient = Patients::where('user_id', $user->id)->first();
            if (!$patient) {
                return response()->json(['message' => 'Patient profile not found'], 404);
            }

            // Use find() instead of findOrFail() for better control
            $appointment = Appointments::with('services')->find($appointmentId);

            if (!$appointment) {
                return response()->json([
                    'message' => 'Appointment not found',
                    'requested_id' => $appointmentId,
                    'patient_id' => $patient->id
                ], 404);
            }

            if ($appointment->patient_id !== $patient->id) {
                return response()->json([
                    'error' => 'Unauthorized',
                    'message' => 'This appointment belongs to another patient'
                ], 403);
            }

            // Add null check for services relationship
            if (!$appointment->services) {
                return response()->json([
                    'message' => 'Service not found for this appointment',
                    'service_id' => $appointment->service_id
                ], 404);
            }

            return response()->json([
                'service_id' => $appointment->service_id,
                'service_name' => $appointment->services->name,
                'price' => $appointment->services->price,
                'appointment_id' => $appointment->id
            ]);

        } catch (\Exception $e) {
            \Log::error('Payment details error:', [
                'error' => $e->getMessage(),
                'appointmentId' => $appointmentId,
                'user_id' => $user->id ?? null
            ]);
            return response()->json([
                'message' => 'Server error',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function initiateMpesaPayment(Request $request)
    {
        $request->validate([
            'phone_number' => 'required|string',
            'appointment_id' => 'required|exists:appointments,id',
            'amount' => 'required|numeric|min:1|max:70000'
        ]);

        $user = auth()->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $patient = Patients::where('user_id', $user->id)->first();

        if (!$patient) {
            return response()->json(['message' => 'Patient profile not found'], 404);
        }

        $appointment = Appointments::findOrFail($request->appointment_id);

        // Generate unique transaction IDs
        $merchantRequestID = 'MPESA-' . Str::uuid();
        $checkoutRequestID = 'MPESA-' . Str::uuid();

        // Save payment record
        $payment = Payments::create([
            'service_id' => $appointment->service_id,
            'patient_id' => $patient->id,
            'appointment_id' => $appointment->id,
            'amount' => $request->amount,
            'phone_number' => $request->phone_number,
            'payment_status' => Payments::STATUS_PENDING,
            'merchant_request_id' => $merchantRequestID,
            'checkout_request_id' => $checkoutRequestID
        ]);
        $amount = (int) round($request->amount); // Round and convert to integer

        // Validate amount meets M-Pesa requirements (1-70000 for most business accounts)
        if ($amount < 1 || $amount > 70000) {
            return response()->json([
                'error' => 'Invalid amount',
                'message' => 'Amount must be between KES 1 and KES 70,000'
            ], 400);
        }

        // Call M-Pesa STK Push
        try {
            $response = $this->stkPushRequest(
                $request->phone_number,
                $amount,
                $merchantRequestID,
                $checkoutRequestID,
                "Payment for appointment #{$appointment->id}"
            );

            return response()->json([
                'message' => 'Payment initiated successfully',
                'payment_id' => $payment->id,
                'mpesa_response' => $response
            ]);
        } catch (\Exception $e) {
            $payment->update([
                'payment_status' => Payments::STATUS_FAILED,
                'result_desc' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Failed to initiate payment',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    private function stkPushRequest($phoneNumber, $amount, $merchantRequestID, $checkoutRequestID, $description)
    {
        $url = config('services.mpesa.stk_push_url');
        $passkey = config('services.mpesa.passkey');
        $businessShortCode = config('services.mpesa.business_shortcode');
        $callbackUrl = config('services.mpesa.callback_url');
        $timestamp = date('YmdHis');

        // Format phone number (2547...)
        $formattedPhone = '254' . substr($phoneNumber, -9);

        // Generate password
        $password = base64_encode($businessShortCode . $passkey . $timestamp);

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->generateAccessToken(),
            'Content-Type' => 'application/json'
        ])->post($url, [
                    'BusinessShortCode' => $businessShortCode,
                    'Password' => $password,
                    'Timestamp' => $timestamp,
                    'TransactionType' => 'CustomerPayBillOnline',
                    'Amount' => $amount,
                    'PartyA' => $formattedPhone,
                    'PartyB' => $businessShortCode,
                    'PhoneNumber' => $formattedPhone,
                    'CallBackURL' => $callbackUrl,
                    'AccountReference' => 'Appt-' . substr($merchantRequestID, 0, 8),
                    'TransactionDesc' => $description,
                    'MerchantRequestID' => $merchantRequestID,
                    'CheckoutRequestID' => $checkoutRequestID
                ]);

        if ($response->failed()) {
            throw new \Exception($response->json()['errorMessage'] ?? 'MPesa API request failed');
        }

        return $response->json();
    }

    private function generateAccessToken()
    {
        $consumerKey = config('services.mpesa.consumer_key');
        $consumerSecret = config('services.mpesa.consumer_secret');
        $url = config('services.mpesa.auth_url');

        $response = Http::withBasicAuth($consumerKey, $consumerSecret)
            ->get($url);

        if ($response->failed()) {
            throw new \Exception('Failed to generate M-Pesa access token');
        }

        return $response->json('access_token');
    }

    public function mpesaCallback(Request $request)
    {
        $data = $request->all();

        \Log::info('MPesa Callback:', $data);

        $payment = Payments::where('checkout_request_id', $data['Body']['stkCallback']['CheckoutRequestID'])->first();

        if (!$payment) {
            return response()->json(['error' => 'Payment not found'], 404);
        }

        $callback = $data['Body']['stkCallback'];
        $resultCode = $callback['ResultCode'];

        $status = $resultCode == 0 ? Payments::STATUS_COMPLETED : Payments::STATUS_FAILED;

        $payment->update([
            'payment_status' => $status,
            'mpesa_receipt' => $resultCode == 0 ? ($callback['CallbackMetadata']['Item'][1]['Value'] ?? null) : null,
            'transaction_id' => $resultCode == 0 ? ($callback['CallbackMetadata']['Item'][1]['Value'] ?? null) : null,
            'payment_date' => now(),
            'result_code' => $resultCode,
            'result_desc' => $callback['ResultDesc']
        ]);

        //todo list

        return response()->json(['success' => true]);
    }
    public function checkPaymentStatus($paymentId)
    {
        $payment = Payments::findOrFail($paymentId);

        if ($payment->patient->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        return response()->json([
            'payment_id' => $payment->id,
            'payment_status' => $payment->payment_status,
            'updated_at' => $payment->updated_at
        ]);
    }
}