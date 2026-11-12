import React from 'react';
import Title from '../components/Title';
import ExclusiveOffers from '../components/ExclusiveOffers';
import Testimonial from '../components/Testimonial';
import { Link } from 'react-router-dom';

const Experience = () => {
    return (
        <div className="py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32">
            <Title
                title="The QuickStay Experience"
                subTitle="Indulge in unmatched comfort, bespoke amenities, and personalized hospitality."
            />

            <div className="mt-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex flex-col justify-between">
                        <div>
                            <span className="text-3xl">✨</span>
                            <h3 className="text-xl font-bold font-playfair text-gray-800 mt-4 mb-2">
                                Premium Hospitality
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Enjoy handpicked hotels with luxury bedding, private balconies, scenic mountain or sea views, and 24/7 dedicated room service.
                            </p>
                        </div>
                        <Link to="/rooms" className="text-blue-600 font-medium text-sm mt-6 hover:underline">
                            Find Your Room →
                        </Link>
                    </div>

                    <div className="p-8 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 flex flex-col justify-between">
                        <div>
                            <span className="text-3xl">🏊</span>
                            <h3 className="text-xl font-bold font-playfair text-gray-800 mt-4 mb-2">
                                Exclusive Amenities
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Infinity pools, free gourmet breakfasts, complimentary high-speed Wi-Fi, and wellness spas curated for your relaxation.
                            </p>
                        </div>
                        <Link to="/rooms" className="text-amber-600 font-medium text-sm mt-6 hover:underline">
                            Explore Amenities →
                        </Link>
                    </div>

                    <div className="p-8 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 flex flex-col justify-between">
                        <div>
                            <span className="text-3xl">🛡️</span>
                            <h3 className="text-xl font-bold font-playfair text-gray-800 mt-4 mb-2">
                                Flexible Booking
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Zero-hassle booking, secure payments with Stripe, and direct customer support for changes and special requests.
                            </p>
                        </div>
                        <Link to="/my-bookings" className="text-emerald-600 font-medium text-sm mt-6 hover:underline">
                            Manage Bookings →
                        </Link>
                    </div>
                </div>
            </div>

            <div className="mt-16">
                <ExclusiveOffers />
            </div>

            <div className="mt-16">
                <Testimonial />
            </div>
        </div>
    );
};

export default Experience;
