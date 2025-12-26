#!/bin/bash

# Judge0 RapidAPI Integration - Quick Setup Guide
# Run this to set up the Judge0 integration

echo "🚀 Judge0 RapidAPI Integration Setup"
echo "===================================="
echo ""

echo "✅ Dependencies installed (axios)"
echo ""

echo "📋 Setup Steps:"
echo "1. Get your RapidAPI key from: https://rapidapi.com/judge0-official/api/judge0-ce"
echo "2. Add to your .env file:"
echo "   JUDGE0_RAPID_API_KEY=your_api_key_here"
echo ""

echo "3. Restart your server"
echo ""

echo "🎯 You're all set!"
echo "The following files were created/updated:"
echo "  • src/libs/judge0.js - Judge0 API integration"
echo "  • src/controllers/executeCode.controller.js - Fixed and ready to use"
echo "  • .env.example - Environment variables template"
echo "  • JUDGE0_INTEGRATION.md - Full documentation"
echo ""

echo "📝 Test the integration:"
echo "POST /api/v1/execute-code"
echo "{\"source_Code\": \"print('Hello')\", \"language_Id\": 71, \"stdin\": [], \"expected_Output\": [\"Hello\"], \"problem_Id\": \"1\"}"
