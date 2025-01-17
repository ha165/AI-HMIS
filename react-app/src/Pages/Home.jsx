import { Link } from "react-router-dom";
import doctor from '../assets/black-doctor.jpg';
import ward2 from '../assets/ward2.png';
import ward1 from '../assets/hospital-ward.jpg';
export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 flex items-center justify-center">
            <div className="flex items-center justify-between w-full max-w-6xl">
                {/* Left Image */}
                <div className="w-full md:w-2/3 lg:w-3/4 h-full relative">
                    <img
                        src={ward2}
                        alt="Hospital Illustration Left"
                        className="w-full h-auto object-cover rounded-lg shadow-lg"
                    />
                </div>

                {/* Main Content */}
                <div className="text-center max-w-3xl px-6 py-12 bg-white shadow-lg rounded-lg border border-gray-200">
                    <h1 className="text-4xl font-extrabold text-blue-600 mb-4">
                        Welcome to AI-Integrated Hospital Management System
                    </h1>
                    <p className="text-lg text-gray-700 mb-6">
                        Transforming healthcare through technology. Manage patient records, enhance diagnostics, and ensure efficient hospital administration with AI-powered tools.
                    </p>
                    <div className="flex justify-center space-x-4">
                        <Link
                            to="/login"
                            className="px-6 py-3 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700"
                        >
                            Get Started
                        </Link>
                        <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md shadow hover:bg-gray-300">
                            Learn More
                        </button>
                    </div>
                </div>

                {/* Right Image */}
                <div className="w-full md:w-2/3 lg:w-3/4 h-full relative">
                    <img
                        src={ward1}
                        alt="Hospital Illustration Right"
                        className="w-full rounded-lg shadow-lg"
                    />
                </div>
            </div>
        </div>
    );
}
