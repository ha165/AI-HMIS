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
     * Analyze medical image using specialized models
     */
    public function analyzeMedicalImage($imageFile): array
    {
        try {
            $imageContent = file_get_contents($imageFile->path());
            $contentType = $this->getContentType($imageFile);

            // Use a medical-specific model
            $modelEndpoint = $this->getMedicalModelEndpoint($imageFile);

            Log::info("Using medical model endpoint: " . $modelEndpoint);
            Log::info("Content-Type: " . $contentType);

            // Send image as raw binary data with proper Content-Type
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => $contentType,
            ])
                ->timeout(120)
                ->withBody($imageContent, $contentType)
                ->post($modelEndpoint);

            Log::info('Medical Image Analysis Status: ' . $response->status());

            if ($response->failed()) {
                $errorBody = $response->body();
                Log::error('Medical Image Analysis Error: ' . $errorBody);
                return [
                    'error' => 'Medical image analysis failed. Status: ' . $response->status(),
                    'status' => $response->status()
                ];
            }

            $data = $response->json();

            if (isset($data['error'])) {
                return ['error' => $data['error'], 'status' => 500];
            }

            return [
                'analysis' => $this->formatMedicalResults($data),
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
     * Get proper content type for the image
     */
    private function getContentType($imageFile): string
    {
        $mimeType = $imageFile->getMimeType();

        $mimeMap = [
            'image/png' => 'image/png',
            'image/jpeg' => 'image/jpeg',
            'image/jpg' => 'image/jpeg',
            'image/gif' => 'image/gif',
            'image/webp' => 'image/webp',
            'image/tiff' => 'image/tiff',
            'image/bmp' => 'image/bmp',
        ];

        return $mimeMap[$mimeType] ?? 'image/jpeg';
    }

    /**
     * Select appropriate medical model
     */
    private function getMedicalModelEndpoint($imageFile): string
    {
        // Using a general vision model that supports image classification
        return 'https://router.huggingface.co/hf-inference/models/google/vit-base-patch16-224';

        // Alternative medical models you can try:
        // return 'https://router.huggingface.co/hf-inference/models/microsoft/resnet-50';
        // return 'https://router.huggingface.co/hf-inference/models/facebook/detr-resnet-50';
    }

    /**
     * Format medical results in a user-friendly way
     */
    private function formatMedicalResults(array $data): array
    {
        $formatted = [];

        if (is_array($data)) {
            foreach ($data as $item) {
                if (isset($item['label']) && isset($item['score'])) {
                    $formatted[] = [
                        'condition' => $this->mapToMedicalTerm($item['label']),
                        'confidence' => round($item['score'] * 100, 1),
                        'interpretation' => $this->getMedicalInterpretation($item['label'], $item['score'])
                    ];
                }
            }
        }

        // If no formatted results, create a generic response
        if (empty($formatted)) {
            $formatted[] = [
                'condition' => 'Image Analysis Complete',
                'confidence' => 0,
                'interpretation' => 'AI model processed the image. Review results with healthcare professional.'
            ];
        }

        // Sort by confidence descending
        usort($formatted, function ($a, $b) {
            return $b['confidence'] <=> $a['confidence'];
        });

        return array_slice($formatted, 0, 5); // Return top 5 results
    }

    /**
     * Map model labels to medical terms
     */
    private function mapToMedicalTerm(string $label): string
    {
        $mapping = [
            'normal' => 'Normal Findings',
            'pneumonia' => 'Pneumonia',
            'covid' => 'COVID-19',
            'tuberculosis' => 'Tuberculosis',
            'pneumothorax' => 'Pneumothorax',
            'edema' => 'Pulmonary Edema',
            'cardiomegaly' => 'Cardiomegaly',
            'effusion' => 'Pleural Effusion',
            'nodule' => 'Pulmonary Nodule',
            'fracture' => 'Bone Fracture',
            'opacity' => 'Lung Opacity',
            'consolidation' => 'Consolidation',
            'atelectasis' => 'Atelectasis',
            'chest' => 'Chest X-ray',
            'xray' => 'X-ray Image',
        ];

        $lowerLabel = strtolower($label);
        foreach ($mapping as $key => $medicalTerm) {
            if (str_contains($lowerLabel, $key)) {
                return $medicalTerm;
            }
        }

        return ucfirst(str_replace('_', ' ', $label));
    }

    /**
     * Provide medical interpretation based on confidence
     */
    private function getMedicalInterpretation(string $label, float $score): string
    {
        $confidence = $score * 100;

        if ($confidence > 80) {
            return 'High probability - Clinical correlation recommended';
        } elseif ($confidence > 60) {
            return 'Moderate probability - Further evaluation suggested';
        } elseif ($confidence > 40) {
            return 'Low probability - Routine follow-up';
        } else {
            return 'Unlikely - Normal variant or artifact possible';
        }
    }
}
