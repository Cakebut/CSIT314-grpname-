import { useEffect, useState } from 'react';

function Video() {
    const [currentIndex, setCurrentIndex] = useState(0); // Track the active video index

    useEffect(() => {
        const videos = document.querySelectorAll(".video");

        const switchVideo = () => {
            // Remove "active" class from all videos and buttons
            videos.forEach((video) => video.classList.remove("active"));

            // Add "active" class to the current video and button
            videos[currentIndex].classList.add("active");
        };

        switchVideo(); // Initialize the active state for the first render

        // Set up a timer to change the video every 5 seconds
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % videos.length);
        }, 8000); // Change video every 5 seconds

        return () => clearInterval(interval); // Clean up the timer when the component unmounts
    }, [currentIndex]); // Re-run effect whenever currentIndex changes

    return (
        <>
        <div>
            <video className="video active" src="/assets/videos/highfive.mp4" autoPlay muted loop />
            <video className="video" src="/assets/videos/shake.mp4" autoPlay muted loop />
            <video className="video" src="/assets/videos/hooman.mp4" autoPlay muted loop />
        </div>
        </>
    );
}

export default Video;