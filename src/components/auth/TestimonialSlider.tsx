'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote } from 'lucide-react';

const testimonials = [
    {
        quote: "TaxMate has completely transformed how our firm manages client compliance. The real-time chat and document management are game-changers.",
        author: "CA Rajesh Sharma",
        role: "Senior Partner, Sharma & Associates",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh"
    },
    {
        quote: "As a small business owner, finding the right CA was tough. TaxMate matched me with a professional who understands my industry perfectly.",
        author: "Amit Patel",
        role: "Founder, TechGrowth Solutions",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amit"
    },
    {
        quote: "The automated reminders and meeting scheduling save me hours every week. It's the most comprehensive CA platform I've used.",
        author: "CA Priya Mehta",
        role: "Independent Practitioner",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya"
    }
];

export const TestimonialSlider = () => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative h-64 overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                >
                    <Quote className="text-blue-400 w-10 h-10 mb-4 opacity-50" />
                    <p className="text-xl text-blue-50 italic mb-6">
                        "{testimonials[index].quote}"
                    </p>
                    <div className="flex items-center gap-4">
                        <img
                            src={testimonials[index].avatar}
                            alt={testimonials[index].author}
                            className="w-12 h-12 rounded-full border-2 border-blue-400/30"
                        />
                        <div>
                            <h4 className="font-bold text-white">{testimonials[index].author}</h4>
                            <p className="text-sm text-blue-300">{testimonials[index].role}</p>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="absolute bottom-0 left-0 flex gap-2">
                {testimonials.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setIndex(i)}
                        className={`w-2 h-2 rounded-full transition-all ${i === index ? 'bg-blue-400 w-6' : 'bg-blue-800'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};
