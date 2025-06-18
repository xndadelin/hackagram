"use client";

import { useEffect } from 'react';

export default function AuthHome() {
  useEffect(() => {
    window.location.href = '/';
  }, []);
  
  return null;
}
