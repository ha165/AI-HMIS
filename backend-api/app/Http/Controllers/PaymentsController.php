<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Service;
use App\Models\Payments;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;

class PaymentsController extends Controller
{
    // app/Http/Controllers/PaymentController.php
    public function initiateSTK(Request $request)
    {
        $request->validate([
            'phone' => 'required|string|size=12',
            'service_id' => 'required|exists:services,id',
            'patient_id' => 'required|exists:patients,id'
        ]);

        $service = Service::find($request->service_id);

        $payment = Payments::create([
            'service_id' => $service->id,
            'patient_id' => $request->patient_id,
            'amount' => $service->price,
            'phone_number' => $request->phone,
            'transaction_id' => 'APP' . time(),
            'payment_status' => Payments::STATUS_PENDING
        ]);

        // Initiate STK Push
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->generateAccessToken(),
        ])->post(config('services.mpesa.stk_url'), [
                    'BusinessShortCode' => config('services.mpesa.shortcode'),
                    'Password' => $this->generatePassword(),
                    'Timestamp' => now()->format('YmdHis'),
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

        if ($response->successful() && $responseData['ResponseCode'] == '0') {
            $payment->update([
                'merchant_request_id' => $responseData['MerchantRequestID'],
                'checkout_request_id' => $responseData['CheckoutRequestID'],
                'payment_status' => Payments::STATUS_PROCESSING
            ]);

            return response()->json([
                'success' => true,
                'payment_id' => $payment->id,
                'message' => 'Payment initiated successfully. Please complete on your phone.'
            ]);
        }

        $payment->update([
            'payment_status' => Payments::STATUS_FAILED,
            'result_desc' => $responseData['errorMessage'] ?? 'STK push failed'
        ]);

        return response()->json([
            'success' => false,
            'message' => 'Failed to initiate payment: ' . ($responseData['errorMessage'] ?? 'Unknown error')
        ], 400);
    }

    public function paymentCallback(Request $request)
    {
        $callbackData = $request->all();

        // Safaricom callback has nested data
        $stkCallback = $callbackData['Body']['stkCallback'] ?? null;
        $merchantRequestId = $stkCallback['MerchantRequestID'] ?? null;
        $checkoutRequestId = $stkCallback['CheckoutRequestID'] ?? null;

        $payment = Payments::where('merchant_request_id', $merchantRequestId)
            ->orWhere('checkout_request_id', $checkoutRequestId)
            ->first();

        if (!$payment) {
            Log::error('Payment not found for callback', $callbackData);
            return response()->json(['ResultCode' => 1, 'ResultDesc' => 'Payment not found']);
        }

        $resultCode = $stkCallback['ResultCode'] ?? 1;
        $resultDesc = $stkCallback['ResultDesc'] ?? 'Failed';

        if ($resultCode == 0) {
            // Successful payment
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
        } else {
            // Failed payment
            $payment->update([
                'payment_status' => Payments::STATUS_FAILED,
                'result_code' => $resultCode,
                'result_desc' => $resultDesc
            ]);
        }

        return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Success']);
    }

    public function checkPaymentStatus($id)
    {
        $payment = Payments::findOrFail($id);

        return response()->json([
            'payment_status' => $payment->payment_status,
            'is_successful' => $payment->isSuccessful(),
            'result_desc' => $payment->result_desc,
            'last_updated' => $payment->updated_at
        ]);
    }
    public function paymentCallback(Request $request)
    {
        // Process M-Pesa callback
        $data = $request->all();

        // Find payment by reference
        $payment = Payments::where('transaction_id', $data['BillRefNumber'])->first();

        if ($payment) {
            $payment->update([
                'status' => $data['ResultCode'] == 0 ? 'completed' : 'failed',
                'mpesa_receipt' => $data['MpesaReceiptNumber'] ?? null,
                'payment_date' => Carbon::now(),
                'transaction_id' => $data['TransactionID'] ?? $payment->transaction_id
            ]);

            // If payment successful, create appointment
            if ($payment->status == 'completed') {
                // You might want to trigger an event here
            }
        }

        return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Success']);
    }

    private function generateAccessToken()
    {
        // Implement your M-Pesa auth token generation
    }

    private function generatePassword()
    {
        // Implement your M-Pesa password generation
    }
}