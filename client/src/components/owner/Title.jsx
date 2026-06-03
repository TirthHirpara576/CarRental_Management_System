import React from 'react'

const Title = ({ title, subtitle }) => {
    return (
        <>
            <h1 className="text-3xl font-medium">{title}</h1>
            <p className="text-gray-500/90 text-sm md:text-base mt-2">{subtitle}</p>
        </>
    )
}

export default Title