<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ImageAnalysisService
{
    protected string $apiKey;

    public function __construct()
    {
        $this->apiKey = env('HF_TOKEN');
    }

    /**
     * Analyze image using Hugging Face model
     */
    public function analyzeImage($imageFile): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
            ])
                ->timeout(60) // Increase timeout for image processing
                ->attach('data', file_get_contents($imageFile->path()), $imageFile->getClientOriginalName())
                ->post('https://router.huggingface.co/hf-inference/models/google/vit-base-patch16-224');

            $data = $response->json();

            // Handle API error
            if (isset($data['error'])) {
                return ['error' => $data['error'], 'status' => $response->status()];
            }

            // Format the response similar to chat service
            return ['analysis' => $data, 'status' => 200];
        } catch (\Exception $e) {
            Log::error('Image Analysis Request Exception: ' . $e->getMessage());
            return ['error' => $e->getMessage(), 'status' => 500];
        }
    }
}
