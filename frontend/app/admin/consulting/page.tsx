import ConsultingDashboard from '@/components/admin/consulting/ConsultingDashboard';

export const metadata = {
    title: 'Consulting Hub - Techwell Admin',
    description: 'Manage Business and IT Consulting engagements',
};

export default function ConsultingPage() {
    return <ConsultingDashboard type="ALL" />;
}
