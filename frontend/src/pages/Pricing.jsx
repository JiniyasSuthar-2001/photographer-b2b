// ==================================================================================
// PAGE: PRICING & SUBSCRIPTION
// Purpose: Allows users to upgrade to premium tiers (Pro/Enterprise).
// Impact: Changes user.plan and user.is_pro in the global state and database.
// Connectivity: 
// - Sidebar.jsx (Linked via trial banner)
// - auth_service.py (Updated user status)
// ==================================================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Zap, Crown, Shield, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { subscriptionService } from '../services/api';
import './Pricing.css';


const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 'Free',
    description: 'Perfect for individual photographers starting their journey.',
    features: [
      'Up to 5 Team Members',
      'Basic Job Hub Access',
      'Calendar Scheduling',
      'Basic Analytics',
      'Community Support'
    ],
    icon: <Zap size={24} />,
    color: '#64748b',
    buttonText: 'Current Plan',
    disabled: true
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₹1,499',
    period: '/month',
    description: 'Scale your studio with unlimited resources and team management.',
    features: [
      'Unlimited Team Members',
      'Advanced Team Locking',
      'Detailed Financial Analytics',
      'Custom Job Roles',
      'Priority Support',
      'No Transaction Fees'
    ],
    icon: <Crown size={24} />,
    color: 'var(--primary-start)',
    buttonText: 'Upgrade to Pro',
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    description: 'Custom solutions for large production houses and agencies.',
    features: [
      'Multi-Studio Management',
      'Dedicated Account Manager',
      'White-label Reports',
      'API Access',
      'Custom Integrations',
      'SLA Guarantees'
    ],
    icon: <Shield size={24} />,
    color: '#1e293b',
    buttonText: 'Contact Sales'
  }
];

export default function Pricing() {
  const { state, dispatch, addToast } = useApp();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgrade = async (planId) => {
    if (planId === 'starter') return;
    if (planId === 'enterprise') {
      addToast('Redirecting to sales inquiry...', 'info');
      return;
    }

    setIsProcessing(true);
    try {
      // API CALL: Connecting to backend/routers/subscription.py
      await subscriptionService.upgrade(planId === 'pro' ? 'Pro' : 'Enterprise');
      
      // Note: We don't need to manually dispatch here because 
      // the WebSocket 'SUBSCRIPTION_UPDATED' event will handle the state update.
      addToast('Processing your upgrade...', 'info');
      
      // Navigate after a short delay to allow WebSocket to hit
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err) {
      addToast('Upgrade failed. Please check your connection.', 'error');
      setIsProcessing(false);
    }
  };


  return (
    <div className="pricing-container">
      <div className="pricing-header">
        <div className="pricing-badge">
          <Sparkles size={14} />
          <span>Flexible Plans</span>
        </div>
        <h1>Elevate Your Production Workflow</h1>
        <p>Choose the plan that fits your studio's ambition. Upgrade or downgrade anytime.</p>
      </div>

      <div className="pricing-grid">
        {PLANS.map((plan) => (
          <div key={plan.id} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
            {plan.popular && <div className="popular-tag">MOST POPULAR</div>}
            
            <div className="plan-icon" style={{color: plan.color, background: `${plan.color}15`}}>
              {plan.icon}
            </div>
            
            <h3 className="plan-name">{plan.name}</h3>
            <div className="plan-price">
              <span className="amount">{plan.price}</span>
              {plan.period && <span className="period">{plan.period}</span>}
            </div>
            <p className="plan-desc">{plan.description}</p>

            <button 
              className={`btn plan-btn ${plan.popular ? 'btn-primary' : 'btn-outline'}`}
              disabled={plan.disabled || isProcessing}
              onClick={() => handleUpgrade(plan.id)}
            >
              {isProcessing && plan.id === 'pro' ? 'Processing...' : plan.buttonText}
              {!plan.disabled && <ArrowRight size={16} />}
            </button>

            <div className="features-list">
              <div className="features-label">WHAT'S INCLUDED</div>
              {plan.features.map((feature, i) => (
                <div key={i} className="feature-item">
                  <Check size={14} className="check-icon" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="pricing-footer">
        <h3>Trusted by 500+ Studios in Gujarat</h3>
        <p>Join the ecosystem that's redefining photography management.</p>
      </div>
    </div>
  );
}
