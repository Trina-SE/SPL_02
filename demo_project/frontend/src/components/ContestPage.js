import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    formatDateTime,
    calculateLength,
    filterContestsByStatus,
    calculateCountdown,
} from '../utils/contestPage';
import '../styles/ContestPage.css';
import { AuthContext } from './AuthContext';
import LoginPrompt from './LoginPrompt';

const ContestPage = () => {
    const { username } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('upcoming');
    const [searchValue, setSearchValue] = useState('');
    const [contestData, setContestData] = useState([]);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch contest data from the backend API
        const fetchContestData = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/approved_contest');
                setContestData(response.data);
            } catch (error) {
                console.error('Error fetching contest data:', error);
            }
        };

        fetchContestData();
    }, []);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    const handleSearch = (e) => {
        setSearchValue(e.target.value);
    };

    const navigateToCreateContest = () => {
        if (username) {
            navigate('/create-contest');
        } else {
            setShowLoginPrompt(true);
        }
    };

    const handleParticipateClick = (contestId) => {
        if (username) {
            navigate(`/participate/${contestId}/${username}`);
        } else {
            setShowLoginPrompt(true);
        }
    };

    const renderContestList = (contests, status) => {
        const currentTime = new Date();
        const filteredContestData = filterContestsByStatus(contests, currentTime, status).filter(contest =>
            contest.title.toLowerCase().includes(searchValue.toLowerCase())
        );

        return (
            <div className="contest-page-list">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Begin Time</th>
                            <th>Length</th>
                            <th>Owner</th>
                            {status === 'upcoming' && <th>Countdown</th>}
                            {status === 'running' && <th>Action</th>}
                            {status === 'previous' && <th>View</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredContestData.map((contest) => (
                            <tr key={contest.acid}>
                                <td>{contest.acid}</td>
                                <td>{contest.title}</td>
                                <td>{formatDateTime(contest.startTime)}</td>
                                <td>{calculateLength(contest.startTime, contest.endTime)}</td>
                                <td>{contest.author.authorName}</td>
                                {status === 'upcoming' && <td>{calculateCountdown(contest.startTime)}</td>}
                                {status === 'running' && (
                                    <td>
                                        <button onClick={() => handleParticipateClick(contest.acid)}>
                                            Participate
                                        </button>
                                    </td>
                                )}
                                {status === 'previous' && (
                                    <td>
                                        <button onClick={() => navigate(`/contest/${contest.acid}`)}>
                                            View
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="contest-page-container">
            <div className="contest-page-header">
                <div className="contest-page-tabs">
                    <button
                        className={`contest-page-tab ${activeTab === 'upcoming' ? 'active' : ''}`}
                        onClick={() => handleTabClick('upcoming')}
                    >
                        Upcoming Contests
                    </button>
                    <button
                        className={`contest-page-tab ${activeTab === 'running' ? 'active' : ''}`}
                        onClick={() => handleTabClick('running')}
                    >
                        Running Contests
                    </button>
                    <button
                        className={`contest-page-tab ${activeTab === 'previous' ? 'active' : ''}`}
                        onClick={() => handleTabClick('previous')}
                    >
                        Previous Contests
                    </button>
                </div>
                <div className="contest-page-search">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchValue}
                        onChange={handleSearch}
                    />
                </div>
                <div className="contest-create-button">
                    <button onClick={navigateToCreateContest}>
                        Create Contest
                    </button>
                </div>
            </div>
            {activeTab === 'upcoming' && renderContestList(contestData, 'upcoming')}
            {activeTab === 'running' && renderContestList(contestData, 'running')}
            {activeTab === 'previous' && renderContestList(contestData, 'previous')}
            {showLoginPrompt && <LoginPrompt onClose={() => setShowLoginPrompt(false)} />}
        </div>
    );
};

export default ContestPage;