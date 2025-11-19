<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class ImageAnalysisService
{
    protected string $apiUrl;

    public function __construct()
    {
        // Local FastAPI server URL
        $this->apiUrl = env('XRAY_API_URL', 'http://127.0.0.1:8000/predict');
    }

    /**
     * Analyze medical image using local FastAPI model
     */
    public function analyzeMedicalImage($imageFile): array
    {
        try {
            $filePath = $imageFile->path();
            Log::info("Sending medical image for analysis", [
                'user_id' => Auth::id() ?? null,
                'file_name' => $imageFile->getClientOriginalName(),
                'file_size' => $imageFile->getSize(),
                'file_type' => $imageFile->getMimeType()
            ]);

            $response = Http::attach(
                'file',
                fopen($filePath, 'r'),
                $imageFile->getClientOriginalName()
            )->post($this->apiUrl);

            if ($response->failed()) {
                Log::error('FastAPI Medical Analysis Failed', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);

                return [
                    'error' => 'Medical analysis service failed.',
                    'status' => $response->status()
                ];
            }

            $data = $response->json();

            // Wrap FastAPI response into same structure as old service
            return [
                'analysis' => [
                    [
                        'condition' => $data['class'] ?? 'Unknown',
                        'confidence' => $data['confidence'] ?? 0,
                        'interpretation' => $this->interpretConfidence($data['confidence'] ?? 0)
                    ]
                ],
                'status' => 200
            ];
        } catch (\Exception $e) {
            Log::error('Medical Image Analysis Exception: ' . $e->getMessage());
            return [
                'error' => 'Medical analysis service unavailable: ' . $e->getMessage(),
                'status' => 500
            ];
        }
    }

    /**
     * Interpret confidence like the old service
     */
    private function interpretConfidence(float $confidence): string
    {
        return match (true) {
            $confidence >= 80 => 'High probability — clinical correlation recommended.',
            $confidence >= 60 => 'Moderate probability — further evaluation needed.',
            $confidence >= 40 => 'Low probability — monitoring suggested.',
            default => 'Very low probability — likely normal or artifact.'
        };
    }
}
