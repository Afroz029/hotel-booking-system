import React from 'react';
import Title from '../components/Title';
import { assets } from '../assets/assets';
import { Link } from 'react-router-dom';

const About = () => {
    return (
        <div className="py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32">
            <Title
                title="About QuickStay"
                subTitle="Redefining luxury travel and hospitality reservations across the globe."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12 items-center">
                <div>
                    <h2 className="text-3xl font-playfair font-bold text-gray-800 mb-4">
                        Seamless Stays, Unforgettable Memories
                    </h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                        Founded with the vision to make extraordinary travel accessible, QuickStay connects discerning travelers with the world's most sought-after hotels and resorts.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        From pristine beachfront villas to vibrant urban retreats, every property listed on our platform is curated to meet rigorous standards of comfort, elegance, and world-class service.
                    </p>
                    <div className="flex gap-4">
                        <Link
                            to="/rooms"
                            className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-all text-sm font-medium"
                        >
                            Explore Hotels
                        </Link>
                    </div>
                </div>

                <div className="relative">
                    <img
                        src={assets.heroImage}
                        alt="QuickStay resort"
                        className="rounded-2xl shadow-xl w-full object-cover max-h-96"
                    />
                </div>
            </div>

            {/* Why Choose Us */}
            <div className="mt-20">
                <h3 className="text-2xl font-playfair font-bold text-center text-gray-800 mb-10">
                    Why Travelers Choose QuickStay
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                            <span className="text-2xl">🏨</span>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">Verified Properties</h4>
                        <p className="text-gray-500 text-sm">Every hotel and room is personally verified for accuracy, cleanliness, and guest satisfaction.</p>
                    </div>

                    <div className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                            <span className="text-2xl">💳</span>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">Secure Payments</h4>
                        <p className="text-gray-500 text-sm">Pay seamlessly and securely with Stripe or choose flexible pay-at-hotel options.</p>
                    </div>

                    <div className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                            <span className="text-2xl">⚡</span>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">Instant Confirmation</h4>
                        <p className="text-gray-500 text-sm">Get real-time booking updates and email confirmations delivered straight to your inbox.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
