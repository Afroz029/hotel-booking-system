
import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {

    return (
        <footer className='bg-[#F6F9FC] text-gray-500/80 pt-10 px-6 md:px-16 lg:px-24 xl:px-32'>

            {/* Main Footer */}
            <div className='flex flex-wrap justify-between gap-12 md:gap-8'>

                {/* Company Information */}
                <div className='max-w-80'>
                    <img
                        src={assets.logo}
                        alt="QuickStay Logo"
                        className='mb-4 h-8 md:h-9 invert opacity-80'
                    />

                    <p className='text-sm leading-6'>
                        Discover the world's most extraordinary places to stay,
                        from boutique hotels to luxury villas.
                    </p>

                    {/* Social Media Links */}
                    <div className='flex items-center gap-4 mt-5'>

                        <a href="#" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                            <img src={assets.instagramIcon} alt="" className='w-6 hover:opacity-70 transition' />
                        </a>

                        <a href="#" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                            <img src={assets.facebookIcon} alt="" className='w-6 hover:opacity-70 transition' />
                        </a>

                        <a href="#" aria-label="Twitter" target="_blank" rel="noopener noreferrer">
                            <img src={assets.twitterIcon} alt="" className='w-6 hover:opacity-70 transition' />
                        </a>

                        <a href="#" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                            <img src={assets.linkedinIcon} alt="" className='w-6 hover:opacity-70 transition' />
                        </a>

                    </div>
                </div>


                {/* Company Links */}
                <div>
                    <h3 className='font-playfair text-lg text-gray-800'>
                        COMPANY
                    </h3>

                    <ul className='mt-4 flex flex-col gap-3 text-sm'>
                        <li><a href="#" className='hover:text-black transition'>About</a></li>
                        <li><a href="#" className='hover:text-black transition'>Careers</a></li>
                        <li><a href="#" className='hover:text-black transition'>Press</a></li>
                        <li><a href="#" className='hover:text-black transition'>Blog</a></li>
                        <li><a href="#" className='hover:text-black transition'>Partners</a></li>
                    </ul>
                </div>


                {/* Support Links */}
                <div>
                    <h3 className='font-playfair text-lg text-gray-800'>
                        SUPPORT
                    </h3>

                    <ul className='mt-4 flex flex-col gap-3 text-sm'>
                        <li>
                            <a
                                href="https://quickstay.tawk.help"
                                target="_blank"
                                rel="noopener noreferrer"
                                className='hover:text-black transition'
                            >
                                Help Center
                            </a>
                        </li>

                        <li><a href="#" className='hover:text-black transition'>Safety Information</a></li>
                        <li><a href="#" className='hover:text-black transition'>Cancellation Options</a></li>
                        <li><a href="#" className='hover:text-black transition'>Contact Us</a></li>
                        <li><a href="#" className='hover:text-black transition'>Accessibility</a></li>
                    </ul>
                </div>


                {/* Newsletter */}
                <div className='max-w-80 w-full'>

                    <h3 className='font-playfair text-lg text-gray-800'>
                        STAY UPDATED
                    </h3>

                    <p className='mt-4 text-sm leading-6'>
                        Subscribe to our newsletter for travel inspiration
                        and exclusive offers.
                    </p>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            alert('Newsletter subscription is not connected yet.')
                        }}
                        className='flex items-center mt-4'
                    >

                        <input
                            type="email"
                            required
                            className='bg-white rounded-l border border-gray-300 h-10 px-3 outline-none w-full min-w-0 focus:border-gray-500'
                            placeholder='Your email address'
                        />

                        <button
                            type="submit"
                            aria-label="Subscribe to newsletter"
                            className='flex items-center justify-center bg-black h-10 w-11 shrink-0 rounded-r hover:bg-gray-800 transition cursor-pointer'
                        >

                            <svg
                                className="w-4 h-4 text-white"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 12H5m14 0-4 4m4-4-4-4"
                                />
                            </svg>

                        </button>

                    </form>
                </div>

            </div>


            {/* Divider */}
            <hr className='border-gray-300 mt-10' />


            {/* Copyright and Bottom Links */}
            <div className='flex flex-col md:flex-row gap-4 items-center justify-between py-6 text-sm'>

                <p>
                    © {new Date().getFullYear()} QuickStay. All rights reserved.
                </p>

                <ul className='flex items-center gap-5'>
                    <li><a href="#" className='hover:text-black transition'>Privacy</a></li>
                    <li><a href="#" className='hover:text-black transition'>Terms</a></li>
                    <li><a href="#" className='hover:text-black transition'>Sitemap</a></li>
                </ul>

            </div>

        </footer>
    )
}

export default Footer
