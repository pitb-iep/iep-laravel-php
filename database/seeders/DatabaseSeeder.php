<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Student;
use App\Models\Domain;
use App\Models\SubSkill;
use App\Models\Goal;
use App\Models\IEP;
use App\Models\Log;
use App\Models\Incident;
use App\Models\Assessment;
use App\Models\DailySummary;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->command->info('🗑️  Clearing database...');
        
        // Clear all tables
        DailySummary::truncate();
        Assessment::truncate();
        Incident::truncate();
        Log::truncate();
        IEP::truncate();
        Goal::truncate();
        SubSkill::truncate();
        Domain::truncate();
        \DB::table('student_user')->truncate();
        Student::truncate();
        User::truncate();

        $this->command->info('👥 Creating users...');
        
        // Create admin and teachers
        $admin = User::create([
            'name' => 'Admin',
            'full_name' => 'System Administrator',
            'email' => 'admin@school.com',
            'password' => Hash::make('password123'),
            'role' => 'Admin',
        ]);

        $tSarah = User::create([
            'name' => 'Ms. Sarah',
            'full_name' => 'Sarah Johnson',
            'email' => 'sarah@school.com',
            'password' => Hash::make('password123'),
            'role' => 'Teacher',
        ]);

        $tAli = User::create([
            'name' => 'Mr. Ali',
            'full_name' => 'Ali Raza',
            'email' => 'ali@school.com',
            'password' => Hash::make('password123'),
            'role' => 'Teacher',
        ]);

        $tFatima = User::create([
            'name' => 'Ms. Fatima',
            'full_name' => 'Fatima Akhtar',
            'email' => 'fatima@school.com',
            'password' => Hash::make('password123'),
            'role' => 'Teacher',
        ]);

        $teachers = [$tSarah, $tAli, $tFatima];

        // Create parent users
        $parentUsers = [];
        for ($i = 0; $i < 15; $i++) {
            $parentUsers[] = User::create([
                'name' => 'Parent ' . ($i + 1),
                'full_name' => 'Parent ' . ($i + 1) . ' Name',
                'email' => 'parent' . ($i + 1) . '@example.com',
                'password' => Hash::make('password123'),
                'role' => 'Parent',
            ]);
        }

        $this->command->info('🎯 Creating curriculum domains and goals...');
        
        // Create Communication & Language Development Domain
        $cldDomain = Domain::create([
            'code' => 'CLD',
            'name' => 'Communication & Language Development',
            'description' => 'Curriculum items for Communication & Language Development',
            'abbreviation' => 'CLD',
            'sequence' => 1,
        ]);

        // Create Receptive Language Sub-Skill
        $receptiveSubSkill = SubSkill::create([
            'domain_id' => $cldDomain->id,
            'name' => 'Receptive Language',
            'description' => 'Understanding and following verbal instructions',
            'sequence' => 1,
        ]);

        // Create Expressive Language Sub-Skill
        $expressiveSubSkill = SubSkill::create([
            'domain_id' => $cldDomain->id,
            'name' => 'Expressive Language',
            'description' => 'Using words and phrases to communicate',
            'sequence' => 2,
        ]);

        // Sample goals from CLD domain - Receptive Language
        $goals = [
            [
                'code' => 'CLD-001',
                'sub_skill_id' => $receptiveSubSkill->id,
                'title' => 'Responds to name when called',
                'description' => '1. Smiles or shows awareness when name is called. 2. Responds to name in 2/3 different settings. 3. Responds to name with background noise. 4. Responds across people (e.g., teacher, parent). 5. Responds from different directions. 6. Responds without a visual cue. 7. Pauses activity momentarily. 8. Maintains response consistently.',
                'tier' => 'A',
                'age_group' => '4-6',
                'skill_type' => 'Communication',
                'prompt_level' => 'Verbal',
                'mastery_criteria' => 90,
                'measurement_type' => 'Percentage',
                'short_term_objectives' => json_encode([
                    'Smiles or shows awareness when name is called',
                    'Responds to name in 2/3 different settings',
                    'Responds to name with background noise',
                    'Responds across people',
                    'Responds from different directions',
                    'Responds without a visual cue',
                    'Pauses activity momentarily',
                    'Maintains response consistently'
                ]),
            ],
            [
                'code' => 'CLD-002',
                'sub_skill_id' => $receptiveSubSkill->id,
                'title' => 'Follows one-step instructions',
                'description' => '1. Follows "Sit down," "Stand up." 2. Follows direction with one object. 3. Complies within 5 seconds. 4. Follows instructions across 3 settings. 5. Generalizes to different adults. 6. Understands simple commands with gestures. 7. Reduces need for prompting. 8. Follows consistently.',
                'tier' => 'A',
                'age_group' => '4-6',
                'skill_type' => 'Communication',
                'prompt_level' => 'Verbal',
                'mastery_criteria' => 90,
                'measurement_type' => 'Percentage',
                'short_term_objectives' => json_encode([
                    'Follows "Sit down," "Stand up."',
                    'Follows direction with one object',
                    'Complies within 5 seconds',
                    'Follows instructions across 3 settings',
                    'Generalizes to different adults',
                    'Understands simple commands with gestures',
                    'Reduces need for prompting',
                    'Follows consistently'
                ]),
            ],
            [
                'code' => 'CLD-003',
                'sub_skill_id' => $receptiveSubSkill->id,
                'title' => 'Points to common objects',
                'description' => '1. Locates an item from an array of 4. 2. Labels items after pointing. 3. Maintains pointing for 3 sec. 4. Points across different books. 5. Points to the requested toy in play. 6. Points to picture symbol (AAC). 7. Generalizes across settings. 8. Independent identification.',
                'tier' => 'A',
                'age_group' => '4-6',
                'skill_type' => 'Communication',
                'prompt_level' => 'Gestural',
                'mastery_criteria' => 90,
                'measurement_type' => 'Percentage',
                'short_term_objectives' => json_encode([
                    'Locates an item from an array of 4',
                    'Labels items after pointing',
                    'Maintains pointing for 3 sec',
                    'Points across different books',
                    'Points to the requested toy in play',
                    'Points to picture symbol (AAC)',
                    'Generalizes across settings',
                    'Independent identification'
                ]),
            ],
            [
                'code' => 'CLD-006',
                'sub_skill_id' => $expressiveSubSkill->id,
                'title' => 'Uses 1-word to express wants',
                'description' => '1. Uses labels across 3 categories. 2. Labels during play. 3. Uses words to request preferred item. 4. Uses 5-10 consistent words. 5. Labels without a prompt in 3 trials. 6. Uses the name of a person/item. 7. Spontaneous requests. 8. Generalizes across settings.',
                'tier' => 'A',
                'age_group' => '4-6',
                'skill_type' => 'Communication',
                'prompt_level' => 'Verbal',
                'mastery_criteria' => 80,
                'measurement_type' => 'Percentage',
                'short_term_objectives' => json_encode([
                    'Uses labels across 3 categories',
                    'Labels during play',
                    'Uses words to request preferred item',
                    'Uses 5-10 consistent words',
                    'Labels without a prompt in 3 trials',
                    'Uses the name of a person/item',
                    'Spontaneous requests',
                    'Generalizes across settings'
                ]),
            ],
            [
                'code' => 'CLD-007',
                'sub_skill_id' => $expressiveSubSkill->id,
                'title' => 'Uses 2-3 word phrases',
                'description' => '1. Says "want car," "go outside." 2. Uses 10 different 2-word phrases. 3. Expands utterance with visual support. 4. Answers "What do you want?" 5. Combines with pointing. 6. Uses on AAC if applicable. 7. Initiates phrase without model. 8. Generalizes across settings.',
                'tier' => 'A',
                'age_group' => '4-6',
                'skill_type' => 'Communication',
                'prompt_level' => 'Verbal',
                'mastery_criteria' => 80,
                'measurement_type' => 'Percentage',
                'short_term_objectives' => json_encode([
                    'Says "want car," "go outside."',
                    'Uses 10 different 2-word phrases',
                    'Expands utterance with visual support',
                    'Answers "What do you want?"',
                    'Combines with pointing',
                    'Uses on AAC if applicable',
                    'Initiates phrase without model',
                    'Generalizes across settings'
                ]),
            ],
        ];

        $goalIds = [];
        foreach ($goals as $goalData) {
            $goal = Goal::create($goalData);
            $goalIds[] = $goal->id;
        }

        $this->command->info('🎓 Creating students...');
        
        $firstNames = ['Ayesha', 'Bilal', 'Hamza', 'Zainab', 'Omar', 'Fatima', 'Yusuf', 'Mariam', 'Ibrahim', 'Hassan'];
        $lastNames = ['Khan', 'Ahmed', 'Raza', 'Malik', 'Hussain', 'Shah', 'Iqbal', 'Chaudhry'];
        $diagnoses = ['ASD Level 1', 'ASD Level 2', 'ASD Level 3', 'ADHD Combined', 'Speech Delay', 'GDD'];
        $streams = ['Autism Support', 'General Ed', 'Life Skills', 'ECE', 'Junior'];

        $students = [];
        for ($i = 0; $i < 10; $i++) {
            $teacher = $teachers[array_rand($teachers)];
            $student = Student::create([
                'teacher_id' => $teacher->id,
                'name' => $firstNames[array_rand($firstNames)] . ' ' . $lastNames[array_rand($lastNames)],
                'dob' => Carbon::now()->subYears(rand(5, 12))->subDays(rand(1, 365)),
                'diagnosis' => $diagnoses[array_rand($diagnoses)],
                'current_level' => ['New', 'Foundation', 'Developing', 'Advanced'][rand(0, 3)],
                'program_stream' => $streams[array_rand($streams)],
                'active_therapies' => json_encode(['ABA', 'Speech', 'OT'][rand(0, 2)] ? ['ABA'] : ['ABA', 'Speech']),
                'is_active' => true,
            ]);
            
            // Attach parent
            if (isset($parentUsers[$i])) {
                $student->parents()->attach($parentUsers[$i]->id);
            }
            
            $students[] = $student;
        }

        $this->command->info('📝 Creating IEPs...');
        
        foreach ($students as $index => $student) {
            $iep = IEP::create([
                'student_id' => $student->id,
                'created_by' => $student->teacher_id,
                'status' => ['Active', 'Draft'][rand(0, 1)],
                'start_date' => Carbon::now()->subMonths(rand(1, 6)),
                'review_period' => 'Quarterly',
                'strengths' => 'Shows enthusiasm for learning. Responds well to positive reinforcement.',
                'concerns' => 'Communication delays impacting social interaction. Transition difficulties.',
                'impact' => 'Disability affects academic performance through limited verbal expression.',
                'academics' => 'Reading: Pre-primer level. Math: Counts to 20 with 1:1 correspondence.',
                'functional' => 'Toileting: Indicates need 70% of time. Feeding: Uses utensils with prompting.',
                'team_members' => json_encode([
                    ['name' => 'Special Ed Teacher', 'role' => 'Teacher', 'attended' => true],
                    ['name' => 'Parent', 'role' => 'Parent/Guardian', 'attended' => true],
                ]),
                'instructional_accommodations' => json_encode([
                    'Extended time for activities',
                    'Visual schedule displayed',
                    'One-on-one aide support'
                ]),
                'environmental_accommodations' => json_encode([
                    'Quiet corner for breaks',
                    'Noise-canceling headphones available'
                ]),
                'assessment_accommodations' => json_encode([
                    'Extended time on tests',
                    'Picture-based assessments'
                ]),
                'teaching_approach' => 'Applied Behavior Analysis (ABA) with Natural Environment Teaching (NET)',
            ]);

            // Create logs for each student
            $this->command->info("Creating logs for student {$student->name}...");
            
            for ($j = 0; $j < rand(5, 15); $j++) {
                $goal = Goal::find($goalIds[array_rand($goalIds)]);
                $performanceStatuses = ['Achieved', 'Emerging', 'Not Yet'];
                $promptLevels = ['Physical', 'Modeling', 'Gestural', 'Verbal', 'Independent'];
                
                Log::create([
                    'student_id' => $student->id,
                    'recorded_by' => $student->teacher_id,
                    'goal_id' => $goal->id,
                    'iep_id' => $iep->id,
                    'performance_status' => $performanceStatuses[array_rand($performanceStatuses)],
                    'rubric_level' => rand(1, 5),
                    'activity' => 'Discrete Trial Training (DTT)',
                    'trials_correct' => rand(5, 10),
                    'trials_total' => 10,
                    'is_independent' => rand(0, 1) == 1,
                    'prompt_level' => $promptLevels[array_rand($promptLevels)],
                    'session_type' => ['Teaching', 'Baseline', 'Probe'][rand(0, 2)],
                    'include_in_progress' => true,
                    'notes' => 'Student showed good progress during session.',
                    'logged_at' => Carbon::now()->subDays(rand(1, 30)),
                ]);
            }

            // Create incidents
            if (rand(0, 1)) {
                Incident::create([
                    'student_id' => $student->id,
                    'recorded_by' => $student->teacher_id,
                    'behavior_type' => ['Aggression', 'Self-Injury', 'Elopement', 'Property Destruction'][rand(0, 3)],
                    'description' => 'Student became agitated during transition and required calm-down protocol.',
                    'severity' => rand(1, 3),
                    'response' => 'Used de-escalation techniques. Student calmed within 5 minutes.',
                    'reported_to_parent' => rand(0, 1) == 1,
                    'incident_at' => Carbon::now()->subDays(rand(1, 30)),
                ]);
            }
        }

        $this->command->info('✅ Database seeded successfully!');
        $this->command->info('');
        $this->command->info('📊 Summary:');
        $this->command->info('Users: ' . User::count());
        $this->command->info('Students: ' . Student::count());
        $this->command->info('Domains: ' . Domain::count());
        $this->command->info('Sub-Skills: ' . SubSkill::count());
        $this->command->info('Goals: ' . Goal::count());
        $this->command->info('IEPs: ' . IEP::count());
        $this->command->info('Logs: ' . Log::count());
        $this->command->info('Incidents: ' . Incident::count());
        $this->command->info('');
        $this->command->info('🔑 Login Credentials:');
        $this->command->info('Admin: admin@school.com / password123');
        $this->command->info('Teacher: sarah@school.com / password123');
        $this->command->info('Teacher: ali@school.com / password123');
        $this->command->info('Parent: parent1@example.com / password123');
    }
}
