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
     * Analyze medical image using real radiology models
     */
    public function analyzeMedicalImage($imageFile): array
    {
        try {
            $imageContent = file_get_contents($imageFile->path());
            $contentType  = $this->getContentType($imageFile);

            // Primary model (CheXNet)
            $models = [
                'https://router.huggingface.co/hf-inference/chrisjay/chest-xray-chexnet',
                'https://router.huggingface.co/hf-inference/nzuwera/chest-x-ray-disease-classification',
                'https://router.huggingface.co/hf-inference/aryahz/pneumonia-detection',
            ];



            $results = null;

            foreach ($models as $endpoint) {
                $results = $this->queryModel($endpoint, $imageContent, $contentType);

                if ($results !== null) {
                    return [
                        'analysis' => $this->formatMedicalResults($results),
                        'status' => 200
                    ];
                }
            }

            return [
                'error' => 'All medical models failed to analyze the image.',
                'status' => 500
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
     * Send request to a HF model
     */
    private function queryModel(string $endpoint, string $imageContent, string $contentType)
    {
        try {
            Log::info("Sending medical image to model: $endpoint");

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => $contentType
            ])
                ->timeout(120)
                ->withBody($imageContent, $contentType)
                ->post($endpoint);

            if ($response->failed()) {
                Log::warning("Model failed: $endpoint | Status: " . $response->status());
                return null;
            }

            $data = $response->json();

            Log::info("Model response received from: $endpoint");

            return $data;
        } catch (\Exception $e) {
            Log::error("Model exception ($endpoint): " . $e->getMessage());
            return null;
        }
    }

    /**
     * Determine correct content type
     */
    private function getContentType($imageFile): string
    {
        $mime = $imageFile->getMimeType();

        $map = [
            'image/png' => 'image/png',
            'image/jpeg' => 'image/jpeg',
            'image/jpg' => 'image/jpeg',
            'image/webp' => 'image/webp',
            'image/tiff' => 'image/tiff',
            'image/bmp' => 'image/bmp',
        ];

        return $map[$mime] ?? 'image/jpeg';
    }

    /**
     * Format any model output into a unified medical structure
     */
    private function formatMedicalResults(array $data): array
    {
        $results = [];

        // Format A: [{ label: "...", score: 0.85 }, ...]
        if (isset($data[0]) && is_array($data[0]) && isset($data[0]['label'])) {
            foreach ($data as $item) {
                $results[] = [
                    'condition' => $this->mapToMedicalTerm($item['label']),
                    'confidence' => round($item['score'] * 100, 1),
                    'interpretation' => $this->getMedicalInterpretation($item['score']),
                ];
            }
        }

        // Format B: { "Pneumonia": 0.82, "Effusion": 0.20, ... }
        elseif ($this->isAssocArray($data)) {
            foreach ($data as $label => $score) {
                if (!is_numeric($score)) continue;

                $results[] = [
                    'condition' => $this->mapToMedicalTerm($label),
                    'confidence' => round($score * 100, 1),
                    'interpretation' => $this->getMedicalInterpretation($score),
                ];
            }
        }

        // If still empty
        if (empty($results)) {
            return [[
                'condition' => 'Unable to interpret image',
                'confidence' => 0,
                'interpretation' => 'AI could not extract meaningful medical features.'
            ]];
        }

        // Sort highest → lowest confidence
        usort($results, fn($a, $b) => $b['confidence'] <=> $a['confidence']);

        // Return only top 5
        return array_slice($results, 0, 5);
    }

    /**
     * Detect associative array
     */
    private function isAssocArray(array $arr): bool
    {
        return array_keys($arr) !== range(0, count($arr) - 1);
    }

    /**
     * Map model label names to medical terms
     */
    private function mapToMedicalTerm(string $label): string
    {
        $mapping = [
            'pneumonia' => 'Pneumonia',
            'cardiomegaly' => 'Cardiomegaly',
            'effusion' => 'Pleural Effusion',
            'edema' => 'Pulmonary Edema',
            'atelectasis' => 'Atelectasis',
            'nodule' => 'Pulmonary Nodule',
            'opacity' => 'Lung Opacity',
            'mass' => 'Pulmonary Mass',
            'consolidation' => 'Consolidation',
            'infiltration' => 'Infiltration',
            'fibrosis' => 'Pulmonary Fibrosis'
        ];

        $labelLower = strtolower($label);

        foreach ($mapping as $key => $value) {
            if (str_contains($labelLower, $key)) {
                return $value;
            }
        }

        return ucfirst(str_replace('_', ' ', $label));
    }

    /**
     * Medical interpretation logic
     */
    private function getMedicalInterpretation(float $score): string
    {
        $confidence = $score * 100;

        return match (true) {
            $confidence >= 80 => 'High probability — clinical correlation recommended.',
            $confidence >= 60 => 'Moderate probability — further evaluation needed.',
            $confidence >= 40 => 'Low probability — monitoring suggested.',
            default => 'Very low probability — likely normal or artifact.'
        };
    }
}
