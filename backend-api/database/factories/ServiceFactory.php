<?php
namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ServiceFactory extends Factory
{
    protected static $serviceNames = [
        'General Checkup', 'Dental Cleaning', 'Comprehensive Eye Exam', 
        'Physical Therapy Session', 'Childhood Vaccination', 'Allergy Testing Panel',
        'Complete Blood Count', 'Chest X-Ray', 'Abdominal Ultrasound', 'Brain MRI Scan',
        'Electrocardiogram (ECG)', 'Colonoscopy Procedure', 'Upper Endoscopy', 
        'Flu Vaccination', 'Chiropractic Adjustment', 'Dermatology Consultation',
        'Cardiology Evaluation', 'Pregnancy Ultrasound', 'Diabetes Screening',
        'Thyroid Function Test', 'Bone Density Scan', 'Hearing Test', 
        'Nutrition Counseling', 'Sports Physical Exam', 'Sleep Study Analysis',
        // Add more variations
        'Pediatric Checkup', 'Geriatric Assessment', 'Women\'s Health Exam',
        'Men\'s Health Screening', 'STD Testing', 'Genetic Testing',
        'Cancer Screening', 'Mental Health Evaluation', 'Physical Exam',
        'Pre-Employment Physical', 'Travel Vaccination', 'Tetanus Shot',
        'Pneumonia Vaccine', 'Shingles Vaccine', 'Blood Pressure Check',
        'Cholesterol Screening', 'Liver Function Test', 'Kidney Function Test',
        'Vitamin Deficiency Test', 'Hormone Level Test', 'Autoimmune Screening',
        'Food Allergy Test', 'Pulmonary Function Test', 'Stress Test',
        'Holter Monitor', 'Echocardiogram', 'CT Scan', 'Mammogram',
        'Prostate Exam', 'Pap Smear', 'Fertility Testing'
    ];

    public function definition()
    {
        $durations = [15, 30, 45, 60, 90, 120];

        return [
            'name' => $this->faker->unique()->randomElement(self::$serviceNames),
            'description' => $this->faker->sentence(10),
            'price' => $this->faker->numberBetween(500, 5000),
            'duration_minutes' => $this->faker->randomElement($durations),
            'is_active' => true,
        ];
    }
}