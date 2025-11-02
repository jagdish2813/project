import { supabase } from '../lib/supabase';

export type UserType = 'admin' | 'designer' | 'customer' | 'none';

export interface UserTypeResult {
  userType: UserType;
  userId: string;
  redirectPath: string;
}

/**
 * Detects the user type and returns the appropriate redirect path
 * This function checks in priority order: admin -> designer -> customer
 */
export async function detectUserTypeAndRedirect(): Promise<UserTypeResult | null> {
  try {
    console.log('detectUserTypeAndRedirect: Starting user type detection...');

    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('detectUserTypeAndRedirect: Session error:', sessionError);
      return null;
    }

    if (!session?.user) {
      console.log('detectUserTypeAndRedirect: No active session');
      return null;
    }

    const userId = session.user.id;
    console.log('detectUserTypeAndRedirect: User ID:', userId);

    // Check 1: Is user an admin?
    console.log('detectUserTypeAndRedirect: Checking admin status...');
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('id, role, is_active')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();

    if (adminError) {
      console.error('detectUserTypeAndRedirect: Admin check error:', adminError);
    } else if (adminData) {
      console.log('detectUserTypeAndRedirect: ✓ User is ADMIN');
      return {
        userType: 'admin',
        userId,
        redirectPath: '/admin'
      };
    }

    // Check 2: Is user a designer?
    console.log('detectUserTypeAndRedirect: Checking designer status...');
    const { data: designerData, error: designerError } = await supabase
      .from('designers')
      .select('id, name, is_active')
      .eq('user_id', userId)
      .maybeSingle();

    if (designerError) {
      console.error('detectUserTypeAndRedirect: Designer check error:', designerError);
    } else if (designerData) {
      console.log('detectUserTypeAndRedirect: ✓ User is DESIGNER');
      return {
        userType: 'designer',
        userId,
        redirectPath: '/designer-dashboard'
      };
    }

    // Check 3: Is user a customer?
    console.log('detectUserTypeAndRedirect: Checking customer status...');
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (customerError) {
      console.error('detectUserTypeAndRedirect: Customer check error:', customerError);
    } else if (customerData && customerData.length > 0) {
      console.log('detectUserTypeAndRedirect: ✓ User is CUSTOMER');
      return {
        userType: 'customer',
        userId,
        redirectPath: '/my-projects'
      };
    }

    // No registration found
    console.log('detectUserTypeAndRedirect: User has no registration');
    return {
      userType: 'none',
      userId,
      redirectPath: '/'
    };

  } catch (error) {
    console.error('detectUserTypeAndRedirect: Unexpected error:', error);
    return null;
  }
}

/**
 * Quick check to see if user is authenticated
 */
export async function isUserAuthenticated(): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session?.user;
  } catch (error) {
    console.error('isUserAuthenticated: Error:', error);
    return false;
  }
}
