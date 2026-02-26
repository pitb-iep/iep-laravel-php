'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { driver, Driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { usePathname } from 'next/navigation';

// Context to expose startTour
const TourContext = createContext<{ startTour: () => void } | null>(null);

export function useTour() {
    return useContext(TourContext);
}

const dashboardSteps = [
    {
        element: '#tour-dashboard-header',
        popover: { title: 'Welcome to IEP Builder', description: 'This is your central command center. Use the "Guide Me" button anytime to revisit this tour.', side: 'bottom' }
    },
    {
        element: '#tour-tile-students',
        popover: { title: 'Total Students', description: 'Shows the total number of students assigned to you. Click to manage your roster.', side: 'bottom' }
    },
    {
        element: '#tour-tile-ieps',
        popover: { title: 'Active IEPs', description: 'Count of currently active Individualized Education Plans.', side: 'bottom' }
    },
    {
        element: '#tour-tile-mastery',
        popover: { title: 'Avg. Mastery Level', description: 'The average rubric level (1-5) across all student logs. A high score means students are nearing independence.', side: 'bottom' }
    },
    {
        element: '#tour-tile-compliance',
        popover: { title: 'IEP Compliance', description: 'Percentage of your students with an active, up-to-date IEP. Aim for 100%!', side: 'bottom' }
    },
    {
        element: '#tour-recent-activity',
        popover: { title: 'Recent Activity Feed', description: 'Live feed of logs, notes, and profile updates. Keep track of what is happening in real-time.', side: 'left' }
    },
    {
        element: '#tour-students-nav',
        popover: { title: 'Student Directory', description: 'Navigate here to view detailed profiles, start IEPs, or log new data.', side: 'right' }
    }
];

const studentsSteps = [
    {
        element: '#tour-students-header',
        popover: { title: 'Students Directory', description: 'Manage all your students in one place.', side: 'bottom' }
    },
    {
        element: '#tour-add-student-btn',
        popover: { title: 'Add New Student', description: 'Click here to register a new student to your roster.', side: 'left' }
    },
    {
        element: '#tour-students-stats',
        popover: { title: 'Quick Stats', description: 'Overview of your total students, active IEPs, and compliance rates.', side: 'bottom' }
    },
    {
        element: '#tour-students-table',
        popover: { title: 'Student List', description: 'Search, filter, and click "View" to see detailed student profiles.', side: 'top' }
    }
];

const profileSteps = [
    {
        element: '#tour-profile-header',
        popover: { title: 'Student Profile', description: 'Overview of the student details, diagnosis, and program info.', side: 'bottom' }
    },
    {
        element: '#tour-profile-mastery',
        popover: { title: 'Goal Mastery', description: 'Visual representation of overall progress towards IEP goals.', side: 'left' }
    },
    {
        element: '#tour-profile-goals',
        popover: { title: 'Active Goals', description: 'List of currently active goals. You can quickly log data from here.', side: 'top' }
    },
    {
        element: '#tour-progress-chart',
        popover: {
            title: '📊 Progress Tracking Chart',
            description: 'Dual-axis visualization showing Accuracy % (blue line) vs. Independence % (green dashed line) over time. The horizontal line at 80% marks the mastery threshold. Hover over data points to see detailed session information including prompt levels.',
            side: 'top'
        }
    },
    {
        element: '#tour-profile-notes',
        popover: { title: 'Clinical Notes', description: 'Review recent session notes and observations.', side: 'left' }
    },
    {
        element: '#tour-profile-actions',
        popover: { title: 'Quick Actions', description: 'Shortcuts to update activities, add notes, or view the full IEP document.', side: 'left' }
    }
];

export default function TourGuide({ children }: { children: React.ReactNode }) {
    const [tourDriver, setTourDriver] = useState<Driver | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        let steps: any[] = [];
        let tourKey = '';

        if (pathname === '/dashboard') {
            steps = dashboardSteps;
            tourKey = 'iep_tour_dashboard_completed';
        } else if (pathname === '/students') {
            steps = studentsSteps;
            tourKey = 'iep_tour_students_completed';
        } else if (pathname?.startsWith('/students/')) {
            steps = profileSteps;
            tourKey = 'iep_tour_profile_completed';
        } else {
            setTourDriver(null);
            return;
        }

        const driverObj = driver({
            showProgress: true,
            animate: true,
            allowClose: true,
            doneBtnText: 'Finish',
            nextBtnText: 'Next',
            prevBtnText: 'Previous',
            onDestroyed: () => {
                localStorage.setItem(tourKey, 'true');
            },
            steps: steps
        });

        setTourDriver(driverObj);

        // Auto-start check (optional, maybe only for dashboard)
        // const hasSeenTour = localStorage.getItem(tourKey);
        // if (!hasSeenTour) {
        //     setTimeout(() => driverObj.drive(), 1500);
        // }

    }, [pathname]);

    const startTour = () => {
        if (tourDriver) {
            tourDriver.drive();
        }
    };

    return (
        <TourContext.Provider value={{ startTour }}>
            {children}
        </TourContext.Provider>
    );
}
