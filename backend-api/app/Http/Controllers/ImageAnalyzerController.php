<?php

namespace App\Http\Controllers;

use App\Services\ImageAnalysisService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ImageAnalyzerController extends Controller
{
    protected ImageAnalysisService $imageAnalysisService;

    public function __construct(ImageAnalysisService $imageAnalysisService)
    {
        $this->imageAnalysisService = $imageAnalysisService;
    }

    public function analyze(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|image|mimes:jpeg,png,jpg,gif|max:10240', // 10MB max
        ]);

        if (!$request->hasFile('file')) {
            return response()->json(['error' => 'No image provided'], 400);
        }

        $image = $request->file('file');

        Log::info("Image analysis request", [
            'user_id' => Auth::id(),
            'file_name' => $image->getClientOriginalName(),
            'file_size' => $image->getSize(),
        ]);

        $result = $this->imageAnalysisService->analyzeImage($image);

        return response()->json($result, $result['status']);
    }
}
