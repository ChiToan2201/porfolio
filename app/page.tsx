import React from 'react';
import PortfolioExperience from '@/components/PortfolioExperience';
import { DEVELOPER_PROFILE, TECH_STACK_ITEMS } from '@/data/portfolio-data';

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: DEVELOPER_PROFILE.fullNamePlaceholder,
      jobTitle: DEVELOPER_PROFILE.role,
      knowsAbout: TECH_STACK_ITEMS.map((item) => item.name),
      url: DEVELOPER_PROFILE.githubUrlPlaceholder,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PortfolioExperience />
    </>
  );
}
