import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// ISP-compliant component
interface AvatarProps {
  imageUrl: string;
  altText: string;
}

function Avatar({ imageUrl, altText }: AvatarProps) {
  return <img src={imageUrl} alt={altText} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />;
}

describe('SOLID - Interface Segregation Principle Tests', () => {
  it('renders Avatar using simple inputs without requiring a bloated User mock', () => {
    render(
      <Avatar 
        imageUrl="https://api.dicebear.com/7.x/bottts/svg?seed=antigravity" 
        altText="Antigravity Agent" 
      />
    );
    
    const avatarImg = screen.getByRole('img');
    
    // Assert attributes
    expect(avatarImg).toBeInTheDocument();
    expect(avatarImg).toHaveAttribute('src', 'https://api.dicebear.com/7.x/bottts/svg?seed=antigravity');
    expect(avatarImg).toHaveAttribute('alt', 'Antigravity Agent');
  });
});
