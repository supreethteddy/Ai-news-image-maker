import Layout from "./Layout.jsx";
import LandingPage from "./LandingPage";
import CreateStoryboard from "./CreateStoryboard";
import MyStoryboards from "./MyStoryboards";
import ViewStoryboard from "./ViewStoryboard";
import CharacterManagement from "./CharacterManagement";
import AdminDashboard from "./AdminDashboard";
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    CreateStoryboard: CreateStoryboard,
    
    MyStoryboards: MyStoryboards,
    
    ViewStoryboard: ViewStoryboard,
    
    CharacterManagement: CharacterManagement,
    
    AdminDashboard: AdminDashboard,
    
    admin: AdminDashboard,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    // Check if we're on the landing page
    const isLandingPage = location.pathname === '/';
    
    // Check if we're on a public story view (slug-based URL)
    // Only treat as public view if it's NOT a known app route
    const knownRoutes = [
      '/createstoryboard',
      '/mystoryboards',
      '/charactermanagement',
      '/admindashboard',
      '/admin'
    ];
    
    // Check if it's viewstoryboard with ?id= parameter (logged in user viewing their own story)
    const isViewStoryboardWithId = location.pathname.toLowerCase() === '/viewstoryboard' && location.search.includes('id=');
    
    const isKnownRoute = knownRoutes.some(route => 
      location.pathname.toLowerCase().startsWith(route)
    );
    
    // Public story view: clean slug URL, but NOT viewstoryboard with ?id=
    const isPublicStoryView = !isLandingPage && !isKnownRoute && !isViewStoryboardWithId;
    
    if (isLandingPage) {
        return <LandingPage />;
    }
    
    // If it's a public story view (clean URL), render without Layout
    if (isPublicStoryView) {
        return <ViewStoryboard />;
    }
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                <Route path="/CreateStoryboard" element={<CreateStoryboard />} />
                <Route path="/MyStoryboards" element={<MyStoryboards />} />
                <Route path="/ViewStoryboard" element={<ViewStoryboard />} />
                <Route path="/CharacterManagement" element={<CharacterManagement />} />
                <Route path="/AdminDashboard" element={<AdminDashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}