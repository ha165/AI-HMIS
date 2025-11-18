<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class HuggingFaceService
{
    protected string $apiKey;

    public function __construct()
    {
        $this->apiKey = env('HUGGINGFACE_API_KEY');
    }

    public function sendMessage(string $message): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])->post('https://api-inference.huggingface.co/models/gpt2', [
                'inputs' => $message,
                'parameters' => [
                    'max_new_tokens' => 100
                ]
            ]);

            $data = $response->json();

            // Hugging Face returns output differently
            if (isset($data['error'])) {
                return ['error' => $data['error'], 'status' => $response->status()];
            }

            if (!isset($data[0]['generated_text'])) {
                return ['error' => 'AI response missing', 'status' => 500];
            }

            return ['response' => $data[0]['generated_text'], 'status' => 200];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage(), 'status' => 500];
        }
    }
}
