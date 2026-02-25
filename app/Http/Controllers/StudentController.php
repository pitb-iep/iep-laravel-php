<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Student::query();
            if (auth('api')->user() && auth('api')->user()->role === 'Parent') {
                $query->whereHas('parents', fn($q) => $q->where('user_id', auth('api')->id()));
            }
            $students = $query->with(['teacher:id,name,email', 'parents:id,name,email', 'logs.goal:id,title', 'ieps'])->get();
            return response()->json(['success' => true, 'count' => $students->count(), 'data' => $students], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 400);
        }
    }

    public function show($id)
    {
        try {
            $student = Student::with(['teacher:id,name,email,full_name', 'parents:id,name,email,full_name', 'logs.goal:id,title', 'ieps'])->find($id);
            if (!$student) return response()->json(['success' => false, 'error' => 'Student not found'], 404);
            return response()->json(['success' => true, 'data' => $student], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 400);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string',
                'dob' => 'sometimes|date',
                'diagnosis' => 'sometimes|string',
                'current_level' => 'sometimes|string',
                'program_stream' => 'sometimes|in:ECE,Junior,Senior,Autism Support,General Ed,Life Skills',
                'active_therapies' => 'sometimes|array',
                'parentEmail' => 'sometimes|email',
                'parentName' => 'sometimes|string',
            ]);

            $studentData = [
                'name' => $validated['name'],
                'dob' => $validated['dob'] ?? null,
                'diagnosis' => $validated['diagnosis'] ?? 'Pending',
                'current_level' => $validated['current_level'] ?? 'New',
                'program_stream' => $validated['program_stream'] ?? 'ECE',
                'active_therapies' => $validated['active_therapies'] ?? [],
            ];

            if (auth('api')->user() && auth('api')->user()->role !== 'Parent') {
                $studentData['teacher_id'] = auth('api')->id();
            }

            $student = Student::create($studentData);

            if (isset($validated['parentEmail'])) {
                $parentUser = User::where('email', $validated['parentEmail'])->first();
                if (!$parentUser) {
                    $tempPassword = substr(str_shuffle('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'), 0, 8);
                    $parentUser = User::create([
                        'name' => $validated['parentName'] ?? 'Parent',
                        'full_name' => $validated['parentName'] ?? 'Parent',
                        'email' => $validated['parentEmail'],
                        'password' => bcrypt($tempPassword),
                        'role' => 'Parent',
                        'force_password_change' => true,
                    ]);
                }
                $student->parents()->attach($parentUser->id);
            }

            return response()->json(['success' => true, 'data' => $student->load('teacher', 'parents', 'logs', 'ieps')], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 400);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $student = Student::find($id);
            if (!$student) return response()->json(['success' => false, 'error' => 'Student not found'], 404);

            $validated = $request->validate([
                'name' => 'sometimes|string',
                'dob' => 'sometimes|date',
                'diagnosis' => 'sometimes|string',
                'current_level' => 'sometimes|string',
                'program_stream' => 'sometimes|in:ECE,Junior,Senior,Autism Support,General Ed,Life Skills',
                'active_therapies' => 'sometimes|array',
                'is_active' => 'sometimes|boolean',
            ]);

            $student->update($validated);
            return response()->json(['success' => true, 'data' => $student], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 400);
        }
    }

    public function destroy($id)
    {
        try {
            $student = Student::find($id);
            if (!$student) return response()->json(['success' => false, 'error' => 'Student not found'], 404);
            $student->delete();
            return response()->json(['success' => true, 'data' => []], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 400);
        }
    }
}
