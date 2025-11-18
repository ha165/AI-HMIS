<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class HuggingFaceService
{
    protected string $apiKey;

    public function __construct()
    {
        $this->apiKey = env('HF_TOKEN'); // Hugging Face API token
    }

    /**
     * Send message to Hugging Face chat model
     */
    public function sendMessage(string $userMessage, array $conversation = []): array
    {
        // Build messages array with previous conversation
        $messages = $conversation;
        $messages[] = ['role' => 'user', 'content' => $userMessage];

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])->post('https://router.huggingface.co/v1/chat/completions', [
                'model' => 'meta-llama/Llama-3.1-8B-Instruct',
                'messages' => $messages,
                'max_tokens' => 200,
            ]);

            // Log raw response
            // Log::info('Hugging Face Raw Response: ' . json_encode($response->json()));

            $data = $response->json();

            // Handle API error
            if (isset($data['error'])) {
                return ['error' => $data['error'], 'status' => $response->status()];
            }

            // Get AI reply
            $aiReply = $data['choices'][0]['message']['content'] ?? null;

            if (!$aiReply) {
                return ['error' => 'AI response missing', 'status' => 500];
            }

            return ['response' => $aiReply, 'status' => 200];
        } catch (\Exception $e) {
            Log::error('Hugging Face Request Exception: ' . $e->getMessage());
            return ['error' => $e->getMessage(), 'status' => 500];
        }
    }
}
