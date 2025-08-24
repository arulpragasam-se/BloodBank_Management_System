import { ClockIcon, HeartIcon, ShieldCheckIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const AboutPage = () => {
  const values = [
    {
      icon: HeartIcon,
      title: 'Life-Saving Mission',
      description: 'Every donation through our platform has the potential to save up to three lives.'
    },
    {
      icon: UserGroupIcon,
      title: 'Community Driven',
      description: 'Building a strong network of donors, hospitals, and medical professionals.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Safety First',
      description: 'Rigorous testing and safety protocols ensure the highest quality blood products.'
    },
    {
      icon: ClockIcon,
      title: 'Always Available',
      description: '24/7 emergency support and rapid response for critical blood needs.'
    }
  ];

  const team = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Medical Director',
      description: 'Leading blood safety protocols and medical oversight.',
      image: '/api/placeholder/150/150'
    },
    {
      name: 'Michael Chen',
      role: 'Operations Manager',
      description: 'Coordinating donor recruitment and hospital partnerships.',
      image: '/api/placeholder/150/150'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Technology Lead',
      description: 'Developing and maintaining our digital platform.',
      image: '/api/placeholder/150/150'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About Our Mission
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Revolutionizing blood bank management in Sri Lanka through technology, 
              ensuring safe and efficient blood donation and distribution.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                The Blood Bank Management System was created to address the critical challenges 
                facing healthcare in Sri Lanka. Our goal is to streamline the entire blood 
                donation process, from donor registration to emergency distribution.
              </p>
              <p className="text-lg text-gray-700 mb-6">
                By leveraging modern web technologies, we ensure that life-saving blood 
                products are available when and where they're needed most, while maintaining 
                the highest standards of safety and efficiency.
              </p>
              <div className="bg-red-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-red-800 mb-2">
                  Vision for 2025
                </h3>
                <p className="text-red-700">
                  To become Sri Lanka's leading digital platform for blood bank management, 
                  connecting every major hospital and creating a nationwide network of life-savers.
                </p>
              </div>
            </div>
            <div className="bg-gray-100 p-8 rounded-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Key Statistics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Registered Donors</span>
                  <span className="font-semibold">1,250+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Partner Hospitals</span>
                  <span className="font-semibold">52</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Blood Units Processed</span>
                  <span className="font-semibold">8,500+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lives Saved</span>
                  <span className="font-semibold text-red-600">25,500+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-lg text-gray-600">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 text-red-600 rounded-full mb-4">
                  <value.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Built with Modern Technology
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our platform uses cutting-edge technologies to ensure reliability, 
              security, and scalability for Sri Lanka's healthcare needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-lg mb-4 inline-block">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                  React
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Modern Frontend</h3>
              <p className="text-gray-600">Built with React and Tailwind CSS for a responsive, user-friendly interface.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-lg mb-4 inline-block">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">
                  Node
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Robust Backend</h3>
              <p className="text-gray-600">Node.js and Express provide a scalable and efficient server architecture.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 p-4 rounded-lg mb-4 inline-block">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                  DB
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure Database</h3>
              <p className="text-gray-600">MongoDB ensures fast, secure, and reliable data storage and retrieval.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Join Our Life-Saving Mission
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Whether you're a donor, hospital, or healthcare professional, 
            there's a place for you in our community.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="/contact"
              className="bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Contact Us
            </a>
            <a
              href="/register"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-red-600 transition-colors"
            >
              Get Started
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;