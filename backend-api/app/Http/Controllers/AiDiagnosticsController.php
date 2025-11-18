<?php

namespace App\Http\Controllers;

use App\Services\HuggingFaceService;
use App\Models\ChatMessage;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class AiDiagnosticsController extends Controller
{
    protected HuggingFaceService $huggingFace;

    public function __construct(HuggingFaceService $huggingFace)
    {
        $this->huggingFace = $huggingFace;
    }

    // Endpoint: POST /api/diagnosis-chat
    public function chat(Request $request): JsonResponse
    {
        $request->validate([
            'message' => 'required|string',
        ]);

        $userMessage = $request->input('message');
        $userId = Auth::id(); 
        // Retrieve conversation history from database for this user
        $conversation = ChatMessage::where('user_id', $userId)
            ->orderBy('created_at')
            ->get(['role', 'content'])
            ->map(fn($msg) => ['role' => $msg->role, 'content' => $msg->content])
            ->toArray();

        // Save user message to DB
        ChatMessage::create([
            'user_id' => $userId,
            'role' => 'user',
            'content' => $userMessage,
        ]);

        $result = $this->huggingFace->sendMessage($userMessage, $conversation);

        if (isset($result['response'])) {
            // Save AI response to DB
            ChatMessage::create([
                'user_id' => $userId,
                'role' => 'assistant',
                'content' => $result['response'],
            ]);
        }

        return response()->json($result, $result['status']);
    }

    // Endpoint: GET /api/chat-history
    public function history(): JsonResponse
    {
        $userId = Auth::id();

        $messages = ChatMessage::where('user_id', $userId)
            ->orderBy('created_at')
            ->get(['role', 'content', 'created_at']);

        return response()->json($messages);
    }
}
