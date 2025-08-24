import { BeakerIcon, HeartIcon, ShieldCheckIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const features = [
    {
      icon: HeartIcon,
      title: 'Save Lives',
      description: 'Your blood donation can save up to 3 lives. Join our community of life-savers.'
    },
    {
      icon: BeakerIcon,
      title: 'Smart Inventory',
      description: 'Real-time tracking of blood units with automated alerts for expiry and low stock.'
    },
    {
      icon: UserGroupIcon,
      title: 'Easy Management',
      description: 'Streamlined processes for donors, hospitals, and blood bank staff.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure & Safe',
      description: 'Your data is protected with industry-standard security measures.'
    }
  ];

  const stats = [
    { number: '1000+', label: 'Registered Donors' },
    { number: '500+', label: 'Lives Saved' },
    { number: '50+', label: 'Partner Hospitals' },
    { number: '24/7', label: 'Emergency Support' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-red-600 to-red-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Give Blood, Save Lives
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Join our Blood Bank Management System and become part of a community dedicated to saving lives through blood donation.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/register"
                className="bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Become a Donor
              </Link>
              <Link
                to="/campaigns"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-red-600 transition-colors"
              >
                Find Campaigns
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-red-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive blood bank management system makes it easy for everyone to contribute to saving lives.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 text-red-600 rounded-full mb-6 group-hover:bg-red-600 group-hover:text-white transition-colors">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of donors who are already making a difference. Register today and start saving lives.
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Emergency Banner */}
      <section className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-5 h-5 text-yellow-400">⚡</div>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Emergency:</strong> O- blood type critically needed. If you're eligible, please contact us immediately at{' '}
                <a href="tel:+94112345678" className="font-medium underline">
                  +94 11 234 5678
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;