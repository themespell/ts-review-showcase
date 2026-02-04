import React, { useState, useEffect, useRef } from 'react';

const VerticalCarousel = ({
                            children,
                            slidesToShow = 1,
                            slidesToScroll = 1,
                            autoplay = false,
                            autoplaySpeed = 3000,
                            repeat = false,
                            infinite = false,
                            transition = 'slide',
                            transitionDuration = 300,
                            centerMode = false,
                            gap = 20,
                            responsive = [
                                {
                                    breakpoint: 1024,
                                    settings: {
                                        slidesToShow: 3,
                                        slidesToScroll: 1
                                    }
                                },
                                {
                                    breakpoint: 768,
                                    settings: {
                                        slidesToShow: 2,
                                        slidesToScroll: 1
                                    }
                                },
                                {
                                    breakpoint: 480,
                                    settings: {
                                        slidesToShow: 1,
                                        slidesToScroll: 1
                                    }
                                }
                            ],
                            className = '',
                            containerClassName = '',
                            slideClassName = '',
                            arrowClassName = ''
                        }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [startY, setStartY] = useState(0);
    const [scrollTop, setScrollTop] = useState(0);
    const sliderRef = useRef(null);
    const transitionRef = useRef(true);

    const getCurrentSettings = () => {
        if (!responsive) return { slidesToShow, slidesToScroll };
        const currentBreakpoint = responsive.find(item => windowWidth <= item.breakpoint);
        return currentBreakpoint ? currentBreakpoint.settings : { slidesToShow, slidesToScroll };
    };

    const { slidesToShow: currentSlidesToShow, slidesToScroll: currentSlidesToScroll } = getCurrentSettings();

    const childrenArray = React.Children.toArray(children);
    const totalOriginalSlides = childrenArray.length;

    const createSlidesArray = () => {
        if (!repeat && !infinite) return childrenArray;

        let slides = [];
        const numberOfSets = 4;

        for (let i = 0; i < numberOfSets; i++) {
            slides = [...slides, ...childrenArray.map((child, index) =>
                React.cloneElement(child, { key: `set-${i}-slide-${index}` })
            )];
        }

        return slides;
    };

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!autoplay) return;
        const interval = setInterval(nextSlide, autoplaySpeed);
        return () => clearInterval(interval);
    }, [currentSlide, autoplay, autoplaySpeed]);

    useEffect(() => {
        if (!infinite) return;

        const handleTransitionEnd = () => {
            if (currentSlide >= (totalOriginalSlides * 3)) {
                transitionRef.current = false;
                setCurrentSlide(totalOriginalSlides);
            }
        };

        const slider = sliderRef.current;
        if (slider) {
            slider.addEventListener('transitionend', handleTransitionEnd);
            return () => slider.removeEventListener('transitionend', handleTransitionEnd);
        }
    }, [currentSlide, infinite, totalOriginalSlides]);

    useEffect(() => {
        if (!transitionRef.current) {
            setTimeout(() => {
                transitionRef.current = true;
            }, 50);
        }
    }, [currentSlide]);

    // Mouse drag handlers for vertical movement
    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartY(e.pageY - sliderRef.current.offsetTop);
        setScrollTop(sliderRef.current.scrollTop);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const y = e.pageY - sliderRef.current.offsetTop;
        const dist = (y - startY);

        if (Math.abs(dist) > 50) {
            if (dist > 0) {
                prevSlide();
            } else {
                nextSlide();
            }
            setIsDragging(false);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Touch handlers for mobile
    const handleTouchStart = (e) => {
        setIsDragging(true);
        setStartY(e.touches[0].pageY - sliderRef.current.offsetTop);
        setScrollTop(sliderRef.current.scrollTop);
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;
        const y = e.touches[0].pageY - sliderRef.current.offsetTop;
        const dist = (y - startY);

        if (Math.abs(dist) > 50) {
            if (dist > 0) {
                prevSlide();
            } else {
                nextSlide();
            }
            setIsDragging(false);
        }
    };

    const nextSlide = () => {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), transitionDuration);

        if (infinite) {
            setCurrentSlide(current => current + currentSlidesToScroll);
        } else {
            setCurrentSlide(current => {
                const next = current + currentSlidesToScroll;
                if (next >= createSlidesArray().length - currentSlidesToShow + 1) {
                    return repeat ? 0 : current;
                }
                return next;
            });
        }
    };

    const prevSlide = () => {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), transitionDuration);

        if (infinite) {
            setCurrentSlide(current => {
                if (current <= 0) {
                    transitionRef.current = false;
                    return totalOriginalSlides * 2;
                }
                return current - currentSlidesToScroll;
            });
        } else {
            setCurrentSlide(current => {
                const prev = current - currentSlidesToScroll;
                if (prev < 0) {
                    return repeat ? createSlidesArray().length - currentSlidesToShow : 0;
                }
                return prev;
            });
        }
    };

    const getTransitionStyles = () => {
        const baseStyles = {
            height: `${100 / currentSlidesToShow}%`,
            flexShrink: 0,
            transition: transitionRef.current ? `all ${transitionDuration}ms ease-in-out` : 'none',
            padding: `${gap/2}px 0`
        };

        if (centerMode) {
            baseStyles.transform = `scale(${isAnimating ? 0.9 : 1})`;
        }

        switch (transition) {
            case 'fade':
                return {
                    ...baseStyles,
                    opacity: isAnimating ? 0 : 1,
                };
            case 'zoom':
                return {
                    ...baseStyles,
                    transform: isAnimating ? 'scale(0.9)' : 'scale(1)',
                };
            case 'flip':
                return {
                    ...baseStyles,
                    transform: isAnimating ? 'rotateX(180deg)' : 'rotateX(0)',
                    backfaceVisibility: 'hidden',
                };
            default: // 'slide'
                return baseStyles;
        }
    };

    const slides = createSlidesArray();
    const slideHeight = 100 / currentSlidesToShow;

    const trackStyles = {
        display: 'flex',
        flexDirection: 'column',
        transform: `translateY(-${(currentSlide * slideHeight)}%)`,
        transition: transitionRef.current ? `transform ${transitionDuration}ms ease-in-out` : 'none',
        marginTop: centerMode ? `-${slideHeight / 2}%` : 0,
        marginBottom: centerMode ? `-${slideHeight / 2}%` : 0,
        height: '100%'
    };

    return (
        <div className={`relative h-full ${containerClassName}`}>
            <div className="overflow-hidden h-full">
                <div
                    ref={sliderRef}
                    className={`flex flex-col ${className}`}
                    style={trackStyles}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleMouseUp}
                >
                    {slides.map((child, index) => (
                        <div
                            key={`slide-${index}`}
                            className={`flex-shrink-0 ${slideClassName} ${
                                centerMode && index === currentSlide ? 'active scale-100' : ''
                            }`}
                            style={getTransitionStyles()}
                        >
                            {child}
                        </div>
                    ))}
                </div>
            </div>

            <button
                onClick={prevSlide}
                className={`absolute top-2 left-1/2 -translate-x-1/2 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-lg z-10 ${arrowClassName}`}
            >
                ↑
            </button>
            <button
                onClick={nextSlide}
                className={`absolute bottom-2 left-1/2 -translate-x-1/2 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-lg z-10 ${arrowClassName}`}
            >
                ↓
            </button>
        </div>
    );
};

export default VerticalCarousel;