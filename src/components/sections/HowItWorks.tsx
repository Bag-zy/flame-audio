import { FiUpload, FiSettings, FiFileText, FiDownload } from 'react-icons/fi';

const steps = [
  {
    step: "01",
    icon: <FiUpload className="w-6 h-6" />,
    title: "Upload Your Audio/Video",
    description: "Drag and drop your audio or video file, or record directly from your microphone. We support MP3, WAV, M4A, and more.",
  },
  {
    step: "02",
    icon: <FiSettings className="w-6 h-6" />,
    title: "Choose Your Settings",
    description: "Select language, enable speaker diarization, add custom vocabulary, and set other processing options.",
  },
  {
    step: "03",
    icon: <FiFileText className="w-6 h-6" />,
    title: "AI Processing",
    description: "Our advanced AI will transcribe your audio with high accuracy, identifying different speakers and timestamps.",
  },
  {
    step: "04",
    icon: <FiDownload className="w-6 h-6" />,
    title: "Download & Share",
    description: "Download your transcript in multiple formats (TXT, SRT, VTT) or share it directly with your team.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Transform your audio into searchable, editable text in just a few simple steps.
          </p>
        </div>
        
        <div className="relative">
          {/* Timeline line */}
          <div className="hidden md:block absolute left-1/2 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-purple-600 transform -translate-x-1/2"></div>
          
          <div className="space-y-12 md:space-y-0">
            {steps.map((step, index) => (
              <div 
                key={index}
                className={`relative flex flex-col md:flex-row items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                {/* Step content */}
                <div className={`w-full md:w-5/12 ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold mb-4">
                      {step.step}
                    </div>
                    <h3 className="text-xl font-semibold mb-3 dark:text-white">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {step.description}
                    </p>
                  </div>
                </div>
                
                {/* Step icon (centered on timeline) */}
                <div className="hidden md:flex w-16 h-16 rounded-full bg-white dark:bg-gray-800 border-4 border-white dark:border-gray-900 shadow-lg items-center justify-center z-10 mx-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white">
                    {step.icon}
                  </div>
                </div>
                
                {/* Empty div for spacing on alternating sides */}
                <div className="hidden md:block w-5/12"></div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <a 
            href="/dashboard" 
            className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Get Started for Free
          </a>
        </div>
      </div>
    </section>
  );
}
