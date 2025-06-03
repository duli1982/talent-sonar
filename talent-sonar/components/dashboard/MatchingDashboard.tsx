import React, { useState } from 'react';
import { Match } from '../../domain/match';
import MatchCard from './MatchCard';
import OutreachModal from './OutreachModal';

interface MatchingDashboardProps {
  jobId: string;
  matches: Match[];
  loading: boolean;
}

const MatchingDashboard: React.FC<MatchingDashboardProps> = ({
  jobId,
  matches,
  loading
}) => {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [showOutreachModal, setShowOutreachModal] = useState(false);

  const handleGenerateOutreach = (match: Match) => {
    setSelectedMatch(match);
    setShowOutreachModal(true);
  };

  const handleCloseOutreach = () => {
    setSelectedMatch(null);
    setShowOutreachModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Finding perfect matches...</span>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🔍</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
        <p className="text-gray-600">Try adjusting your search criteria or check back later.</p>
      </div>
    );
  }

  const highQualityMatches = matches.filter(match => match.overallScore >= 0.7);
  const goodMatches = matches.filter(match => match.overallScore >= 0.5 && match.overallScore < 0.7);
  const potentialMatches = matches.filter(match => match.overallScore < 0.5);

  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-gray-900">{matches.length}</div>
          <div className="text-sm text-gray-600">Total Matches</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-green-600">{highQualityMatches.length}</div>
          <div className="text-sm text-gray-600">High Quality (70%+)</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-blue-600">{goodMatches.length}</div>
          <div className="text-sm text-gray-600">Good Matches (50-70%)</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-yellow-600">{potentialMatches.length}</div>
          <div className="text-sm text-gray-600">Potential (< 50%)</div>
        </div>
      </div>

      {/* High Quality Matches */}

