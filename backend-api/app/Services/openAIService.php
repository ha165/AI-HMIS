<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class OpenAIService
{
    protected string $apiKey;

    public function __construct()
    {
        $this->apiKey = env('OPENAI_API_KEY');
    }

    public function sendMessage(string $message): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4o-mini',
                'messages' => [['role' => 'user', 'content' => $message]],
                'max_tokens' => 100,
            ]);

            $data = $response->json();

            if (!$response->successful()) {
                return [
                    'error' => $data['error']['message'] ?? 'Failed to retrieve AI response',
                    'status' => $response->status()
                ];
            }

            if (!isset($data['choices'][0]['message']['content'])) {
                return ['error' => 'AI response missing content', 'status' => 500];
            }

            return [
                'response' => $data['choices'][0]['message']['content'],
                'status' => 200
            ];
        } catch (\Illuminate\Http\Client\RequestException $e) {
            $status = $e->response?->status() ?? 500;
            $message = $e->response?->json()['error']['message'] ?? $e->getMessage();
            return ['error' => $message, 'status' => $status];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage(), 'status' => 500];
        }
    }
}
