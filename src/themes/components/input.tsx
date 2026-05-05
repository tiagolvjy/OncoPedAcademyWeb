"use client";
import { useState } from "react";
import { Ionicons } from "../../types/ionicos";

export interface AppInputProps {
    name?: string
    type?: string;
    onChange?: (e: any) => void
    placeholder?: string;
    value?: string;
    label?: string;
    icon?: Ionicons
    openPassword?: boolean;
    error?: any
    style?: any;
    className?: string
    disabled?: boolean
}

export default function AppInput ({type="text", name, onChange, placeholder, value, label, icon, openPassword = false, error = "", style = {}, className = '', disabled = false}: AppInputProps ) {
    // -------------------------------------------------------------------------
    const [ showPassword, setShowPassword ] = useState(false);
    const [ touched, setTouched ] = useState(false);
    // -------------------------------------------------------------------------
    return (
        <div className={className} style={style}>
            <p className="ff-default ml-3 mb-[-10px]">{label}</p>
            <div className={`rounded-xl border-[2] border-[#dedede] p-2 flex my-2 ${disabled ? 'bg-[#e9e9e9] opacity-70 cursor-not-allowed' : 'bg-[#f5f5f5]'}`}>
                {icon && <i className={`ion-${icon} mx-2 text-[grey]`} />}
                <input
                    type={openPassword ? showPassword ? "text" : "password" : type}
                    name={name}
                    placeholder={placeholder}
                    value={value}
                    className={`flex-1 bg-transparent outline-none ${disabled ? 'cursor-not-allowed text-[#888]' : ''}`}
                    onChange={onChange}
                    onBlur={() => setTouched(true)}
                    disabled={disabled}
                />
                {openPassword && !disabled && <i className={`${showPassword ? "ion-eye" : "ion-eye-disabled"} mx-2 text-[grey]`} onClick={() => setShowPassword(!showPassword)} />}
            </div>
            {touched && error && <p className="text-[tomato] ff-default text-[12px] text-right mt-[-10px]">{error}</p>}
        </div>
    )
}