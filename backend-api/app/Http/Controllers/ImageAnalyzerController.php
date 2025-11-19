<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ImageAnalyzerController extends Controller
{
    public function analyze(Request $request): JsonResponse
    {
        if (!$request->hasFile('file')) {
            Log::error("No file received in request");
            return response()->json(['error' => 'No image provided'], 400);
        }

        $image = $request->file('file');
        $apiKey = env('HF_TOKEN');

        Log::info("Image received", [
            'name' => $image->getClientOriginalName(),
            'size' => $image->getSize(),
        ]);

        $endpoint = "https://router.huggingface.co/hf-inference/models/google/vit-base-patch16-224";

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
            ])
                ->attach('image', file_get_contents($image->path()), $image->getClientOriginalName())
                ->post($endpoint);

            Log::info("HF response status", ['status' => $response->status()]);
            Log::info("HF response body", ['body' => $response->body()]);

            if ($response->failed()) {
                return response()->json([
                    'error' => 'HuggingFace API error',
                    'details' => $response->body()
                ], 500);
            }

            return response()->json(['analysis' => $response->json()]);
        } catch (\Exception $e) {
            Log::error("Image analyzer crashed", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
