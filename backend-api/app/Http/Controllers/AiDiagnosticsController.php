<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;


class AiDiagnosticsController extends Controller
{
    public function chat(Request $request): JsonResponse
    {
        $userMessage = $request->input('message');
        $apiKey = env('OPENAI_API_KEY');

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4o-mini',
                'messages' => [['role' => 'user', 'content' => $userMessage]],
                'max_tokens' => 100,
            ]);

            $data = $response->json();

            if (!$response->successful()) {
                $message = $data['error']['message'] ?? 'Failed to retrieve AI response';
                return response()->json(['error' => $message], $response->status());
            }

            if (!isset($data['choices'][0]['message']['content'])) {
                return response()->json(['error' => 'AI response missing content'], 500);
            }

            return response()->json([
                'response' => $data['choices'][0]['message']['content']
            ]);
        } catch (\Illuminate\Http\Client\RequestException $e) {
            $status = $e->response?->status() ?? 500;
            $message = $e->response?->json()['error']['message'] ?? $e->getMessage();
            return response()->json(['error' => $message], $status);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Server error: ' . $e->getMessage()], 500);
        }
    }
}
