import React from "react";

interface SpinnerProps {
	size?: "small" | "medium" | "large";
}

const Spinner: React.FC<SpinnerProps> = ({ size = "medium" }) => {
	const sizeClasses = {
		small: "w-4 h-4",
		medium: "w-6 h-6",
		large: "w-8 h-8",
	};
	return <div className={`${sizeClasses[size]} border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin`}></div>;
};

export default Spinner;
