<?php

namespace App\Http\Controllers;

use App\Services\HuggingFaceService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AiDiagnosticsController extends Controller
{
    protected HuggingFaceService $huggingFace;

    public function __construct(HuggingFaceService $huggingFace)
    {
        $this->huggingFace = $huggingFace;
    }

    public function chat(Request $request): JsonResponse
    {
        $request->validate(['message' => 'required|string']);

        $userMessage = $request->input('message');

        // Optional: you can maintain conversation history in session or DB
        $conversation = session()->get('chat_history', []);

        $result = $this->huggingFace->sendMessage($userMessage, $conversation);

        if (isset($result['response'])) {
            // Save message to session history
            $conversation[] = ['role' => 'user', 'content' => $userMessage];
            $conversation[] = ['role' => 'assistant', 'content' => $result['response']];
            session(['chat_history' => $conversation]);
        }

        return response()->json($result, $result['status']);
    }
}
