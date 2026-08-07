import React from 'react';
import { motion } from 'motion/react';

interface SocialIconProps {
  size?: number;
  className?: string;
}

export const FacebookIcon: React.FC<SocialIconProps> = ({ size = 20, className = '' }) => (
  <motion.svg
    viewBox="0 0 24 24"
    style={{ width: size, height: size }}
    className={className}
    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
    transition={{ duration: 0.5 }}
  >
    <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </motion.svg>
);

export const InstagramIcon: React.FC<SocialIconProps> = ({ size = 20, className = '' }) => (
  <motion.svg
    viewBox="0 0 24 24"
    style={{ width: size, height: size }}
    className={className}
    whileHover={{ scale: 1.15, rotate: 5 }}
    transition={{ type: "spring", stiffness: 400, damping: 10 }}
  >
    <defs>
      <linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" style={{ stopColor: '#f09433' }} />
        <stop offset="25%" style={{ stopColor: '#e6683c' }} />
        <stop offset="50%" style={{ stopColor: '#dc2743' }} />
        <stop offset="75%" style={{ stopColor: '#cc2366' }} />
        <stop offset="100%" style={{ stopColor: '#bc1888' }} />
      </linearGradient>
    </defs>
    <path
      fill="url(#instagram-gradient)"
      d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.332 3.608 1.308.975.975 1.245 2.242 1.308 3.607.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.332 2.633-1.308 3.608-.975.975-2.242 1.245-3.607 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.332-3.608-1.308-.975-.975-1.245-2.242-1.308-3.607-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.332-2.633 1.308-3.608.975-.975 2.242-1.245 3.607-1.308 1.266-.058 1.646-.07 4.85-.07zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12s.014 3.667.072 4.947c.2 4.358 2.618 6.778 6.979 6.978 1.28.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.358-.2 6.778-2.618 6.978-6.979.058-1.28.072-1.689.072-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.778-6.979-6.978C15.667.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"
    />
  </motion.svg>
);

export const XIcon: React.FC<SocialIconProps> = ({ size = 20, className = '' }) => (
  <motion.svg
    viewBox="0 0 24 24"
    style={{ width: size, height: size }}
    className={className}
    whileHover={{ scale: 1.1, rotate: -5 }}
  >
    <path fill="#000000" d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.292 19.494h2.039L6.486 3.24H4.298l13.311 17.407z" />
  </motion.svg>
);

export const LinkedInIcon: React.FC<SocialIconProps> = ({ size = 20, className = '' }) => (
  <motion.svg
    viewBox="0 0 24 24"
    style={{ width: size, height: size }}
    className={className}
    whileHover={{ scale: 1.1, y: -2 }}
  >
    <path fill="#0077B5" d="M22.23 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0zM7.12 20.45H3.56V9h3.56v11.45zM5.34 7.58c-1.14 0-2.06-.93-2.06-2.06 0-1.14.92-2.06 2.06-2.06s2.06.92 2.06 2.06c0 1.13-.92 2.06-2.06 2.06zM20.45 20.45h-3.56v-5.6c0-1.34-.03-3.06-1.87-3.06-1.87 0-2.15 1.46-2.15 2.96v5.7h-3.56V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29z" />
  </motion.svg>
);

export const YouTubeIcon: React.FC<SocialIconProps> = ({ size = 20, className = '' }) => (
  <motion.svg
    viewBox="0 0 24 24"
    style={{ width: size, height: size }}
    className={className}
    whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
    transition={{ duration: 0.4 }}
  >
    <path fill="#FF0000" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </motion.svg>
);

export const TikTokIcon: React.FC<SocialIconProps> = ({ size = 20, className = '' }) => (
  <motion.svg
    viewBox="0 0 448 512"
    style={{ width: size, height: size }}
    className={className}
    whileHover={{ scale: 1.1, rotate: [0, -10, 10, -10, 0] }}
    transition={{ duration: 0.5 }}
  >
    <path fill="#000000" d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.32h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z" />
  </motion.svg>
);
