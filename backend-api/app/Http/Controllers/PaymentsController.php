<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Service;
use App\Models\Payments;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class PaymentsController extends Controller
{
    public function initiateSTK(Request $request)
    {
        $request->validate([
            'phone' => 'required|string|size=12',
            'service_id' => 'required|exists:services,id',
            'patient_id' => 'required|exists:patients,id'
        ]);

        $service = Service::find($request->service_id);

        try {
            $payment = Payments::create([
                'service_id' => $service->id,
                'patient_id' => $request->patient_id,
                'amount' => $service->price,
                'phone_number' => $request->phone,
                'transaction_id' => 'APP' . time(),
                'payment_status' => Payments::STATUS_PENDING
            ]);

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->generateAccessToken(),
                'Content-Type' => 'application/json',
            ])->post(config('services.mpesa.stk_url'), [
                        'BusinessShortCode' => config('services.mpesa.shortcode'),
                        'Password' => $this->generatePassword(),
                        'Timestamp' => Carbon::now()->format('YmdHis'),
                        'TransactionType' => 'CustomerPayBillOnline',
                        'Amount' => $service->price,
                        'PartyA' => $request->phone,
                        'PartyB' => config('services.mpesa.shortcode'),
                        'PhoneNumber' => $request->phone,
                        'CallBackURL' => config('services.mpesa.callback_url'),
                        'AccountReference' => $payment->transaction_id,
                        'TransactionDesc' => "Payment for {$service->name}",
                    ]);

            $responseData = $response->json();

            if ($response->successful() && ($responseData['ResponseCode'] ?? '1') == '0') {
                $payment->update([
                    'merchant_request_id' => $responseData['MerchantRequestID'],
                    'checkout_request_id' => $responseData['CheckoutRequestID'],
                    'payment_status' => Payments::STATUS_PROCESSING
                ]);

                return response()->json([
                    'success' => true,
                    'payment_id' => $payment->id,
                    'message' => 'Payment initiated successfully'
                ]);
            }

            $errorMessage = $responseData['errorMessage'] ?? 'STK push failed';
            $payment->update([
                'payment_status' => Payments::STATUS_FAILED,
                'result_desc' => $errorMessage
            ]);

            Log::error('STK Push Initiation Failed', [
                'response' => $responseData,
                'payment_id' => $payment->id
            ]);

            return response()->json([
                'success' => false,
                'message' => $errorMessage
            ], 400);

        } catch (\Exception $e) {
            Log::error('Payment Processing Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Payment processing error'
            ], 500);
        }
    }

    public function paymentCallback(Request $request)
    {
        $callbackData = $request->all();
        Log::info('M-Pesa Callback Received', $callbackData);

        try {
            $stkCallback = $callbackData['Body']['stkCallback'] ?? null;
            if (!$stkCallback) {
                throw new \Exception('Invalid callback format');
            }

            $merchantRequestId = $stkCallback['MerchantRequestID'] ?? null;
            $checkoutRequestId = $stkCallback['CheckoutRequestID'] ?? null;

            $payment = Payments::where('merchant_request_id', $merchantRequestId)
                ->orWhere('checkout_request_id', $checkoutRequestId)
                ->first();

            if (!$payment) {
                throw new \Exception("Payment not found for MerchantRequestID: $merchantRequestId");
            }

            $resultCode = $stkCallback['ResultCode'] ?? 1;
            $resultDesc = $stkCallback['ResultDesc'] ?? 'Failed';

            if ($resultCode == 0) {
                $callbackMetadata = $stkCallback['CallbackMetadata']['Item'] ?? [];
                $metadata = [];

                foreach ($callbackMetadata as $item) {
                    $metadata[$item['Name']] = $item['Value'] ?? null;
                }

                $payment->update([
                    'payment_status' => Payments::STATUS_COMPLETED,
                    'mpesa_receipt' => $metadata['MpesaReceiptNumber'] ?? null,
                    'transaction_id' => $metadata['TransactionDate'] ?? $payment->transaction_id,
                    'payment_date' => now(),
                    'result_code' => $resultCode,
                    'result_desc' => $resultDesc
                ]);

                Log::info('Payment Completed Successfully', [
                    'payment_id' => $payment->id,
                    'mpesa_receipt' => $payment->mpesa_receipt
                ]);
            } else {
                $payment->update([
                    'payment_status' => Payments::STATUS_FAILED,
                    'result_code' => $resultCode,
                    'result_desc' => $resultDesc
                ]);

                Log::error('Payment Failed', [
                    'payment_id' => $payment->id,
                    'result_code' => $resultCode,
                    'result_desc' => $resultDesc
                ]);
            }

            return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Success']);

        } catch (\Exception $e) {
            Log::error('Callback Processing Error', [
                'error' => $e->getMessage(),
                'callback_data' => $callbackData
            ]);

            return response()->json([
                'ResultCode' => 1,
                'ResultDesc' => 'Callback processing failed'
            ]);
        }
    }

    private function generateAccessToken()
    {
        try {
            $response = Http::withBasicAuth(
                config('services.mpesa.consumer_key'),
                config('services.mpesa.consumer_secret')
            )->get(config('services.mpesa.auth_url'));

            return $response->json()['access_token'] ?? null;
        } catch (\Exception $e) {
            Log::error('Access Token Generation Failed', [
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    private function generatePassword()
    {
        $timestamp = Carbon::now()->format('YmdHis');
        $shortcode = config('services.mpesa.shortcode');
        $passkey = config('services.mpesa.passkey');

        return base64_encode($shortcode . $passkey . $timestamp);
    }
}