<?php

namespace App\Http\Controllers;

use App\Services\OpenAIService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AIChatController extends Controller
{
    protected OpenAIService $openAI;

    public function __construct(OpenAIService $openAI)
    {
        $this->openAI = $openAI;
    }

    public function chat(Request $request): JsonResponse
    {
        $request->validate([
            'message' => 'required|string',
        ]);

        $userMessage = $request->input('message');
        $result = $this->openAI->sendMessage($userMessage);

        if (isset($result['error'])) {
            return response()->json(['error' => $result['error']], $result['status']);
        }

        return response()->json(['response' => $result['response']]);
    }
}
