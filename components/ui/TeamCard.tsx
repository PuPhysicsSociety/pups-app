import React from 'react';
import { TeamMember } from '../../types';
import { Linkedin, Mail, User } from 'lucide-react';
import { getImageUrl } from '../../lib/api';

interface TeamCardProps {
  member: TeamMember;
}

export default function TeamCard({ member }: TeamCardProps) {
  return (
    <div className="border-2 bg-white dark:bg-[#25293c] rounded-lg p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col items-center text-center h-full">
      <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4 flex-shrink-0 overflow-hidden">
        {member.photo ? (
          <img
            src={getImageUrl(member.photo)}
            alt={member.name}
            className="w-full h-full object-cover"
            onError={e => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <User size={48} className="text-gray-400 dark:text-gray-500" />
        )}
      </div>
      <h3 className="font-semibold text-xl mb-1">{member.name}</h3>
      <div className="text-sm opacity-70 mb-4">{member.role}</div>
      <div className="flex gap-3 mt-auto pt-2">
        {member.linkedin_url && (
          <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer"
            className="text-muted-foreground opacity-60 hover:opacity-100 transition-opacity duration-200" aria-label="LinkedIn">
            <Linkedin size={24} />
          </a>
        )}
        {member.email && (
          <a href={`mailto:${member.email}`}
            className="text-muted-foreground opacity-60 hover:opacity-100 transition-opacity duration-200" aria-label="Email">
            <Mail size={24} />
          </a>
        )}
      </div>
    </div>
  );
}
