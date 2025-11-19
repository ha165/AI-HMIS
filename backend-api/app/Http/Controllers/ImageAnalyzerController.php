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
            'file' => 'required|image|mimes:jpeg,png,jpg,dicom|max:20480', // 20MB max, allow DICOM
        ]);

        if (!$request->hasFile('file')) {
            return response()->json(['error' => 'No medical image provided'], 400);
        }

        $image = $request->file('file');

        Log::info("Medical image analysis request", [
            'user_id' => Auth::id(),
            'file_name' => $image->getClientOriginalName(),
            'file_size' => $image->getSize(),
            'file_type' => $image->getMimeType(),
        ]);

        $result = $this->imageAnalysisService->analyzeMedicalImage($image);

        return response()->json($result, $result['status']);
    }
}
