import {
  Gathering,
  AttendanceRecord,
  MemberContribution,
  ContributionPeriod,
  PaymentEntry,
  Mezmur,
  AbsenceReasonCategory,
} from '../types';
import { supabase, isLiveSupabaseConfigured } from '../lib/supabase';
import { mahberService } from './mahberService';

class MahberDataService {
  // --- GATHERINGS ---
  async getNextGathering(): Promise<{ data: Gathering | null; error: string | null }> {
    if (isLiveSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('gatherings')
          .select('*')
          .eq('status', 'scheduled')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          return { data: null, error: error.message };
        }
        if (data) {
          return {
            data: {
              id: data.id,
              title: data.title,
              titleAm: data.title_am,
              ethDate: data.ethiopian_date,
              gregDate: data.gregorian_date,
              gregDateRaw: data.gregorian_date,
              time: data.start_time,
              location: data.location,
              locationDetails: data.location_details,
              daysUntil: 12,
              status: data.status,
              program: data.program || [],
              imageUrl: 'https://images.unsplash.com/photo-1548625361-195fe61a55c3?w=800&auto=format&fit=crop&q=80',
            },
            error: null,
          };
        }
      } catch (err: any) {
        return { data: null, error: err.message };
      }
    }

    return { data: mahberService.getNextScheduledGathering(), error: null };
  }

  async createGathering(data: Omit<Gathering, 'id'>): Promise<{ data: Gathering | null; error: string | null }> {
    if (isLiveSupabaseConfigured()) {
      try {
        const { data: inserted, error } = await supabase
          .from('gatherings')
          .insert({
            title: data.title || 'Monthly Mahber',
            title_am: data.titleAm || 'ወርሃዊ ማኅበር',
            ethiopian_date: data.ethDate,
            gregorian_date: data.gregDate,
            start_time: data.time,
            location: data.location,
            location_details: data.locationDetails,
            program: data.program,
            status: 'scheduled',
          })
          .select()
          .single();

        if (error) return { data: null, error: error.message };
        return { data: inserted, error: null };
      } catch (err: any) {
        return { data: null, error: err.message };
      }
    }

    const created = mahberService.createGathering(data);
    return { data: created, error: null };
  }

  async completeGathering(gatheringId: string): Promise<{ success: boolean; error: string | null }> {
    if (isLiveSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('gatherings')
          .update({ status: 'completed' })
          .eq('id', gatheringId);

        if (error) return { success: false, error: error.message };
        return { success: true, error: null };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    mahberService.completeGathering(gatheringId);
    return { success: true, error: null };
  }

  // --- ATTENDANCE ---
  async getAttendance(
    userId: string,
    isAdmin: boolean
  ): Promise<{ data: AttendanceRecord[]; error: string | null }> {
    if (isLiveSupabaseConfigured()) {
      try {
        const queryTable = isAdmin ? 'attendance' : 'attendance_public_roster';
        const { data, error } = await supabase.from(queryTable).select('*');

        if (error) {
          return { data: [], error: error.message };
        }

        const mapped: AttendanceRecord[] = (data || []).map((row: any) => ({
          id: row.id,
          gatheringId: row.gathering_id,
          memberId: row.user_id,
          status: row.status,
          privateReason: row.absence_reason,
          privateNote: row.absence_note,
          adminReviewStatus: row.admin_review_status,
          updatedAt: row.updated_at,
        }));

        return { data: mapped, error: null };
      } catch (err: any) {
        return { data: [], error: err.message };
      }
    }

    return { data: mahberService.getAttendanceForUser(userId, isAdmin), error: null };
  }

  async submitAttendance(
    gatheringId: string,
    userId: string,
    status: 'coming' | 'cant_come',
    reason?: AbsenceReasonCategory,
    note?: string
  ): Promise<{ success: boolean; error: string | null }> {
    if (isLiveSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('attendance').upsert(
          {
            gathering_id: gatheringId,
            user_id: userId,
            status: status === 'coming' ? 'coming' : 'absent',
            absence_reason: status === 'cant_come' ? reason : null,
            absence_note: status === 'cant_come' ? note : null,
            admin_review_status: status === 'cant_come' ? 'pending' : 'not_required',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'gathering_id,user_id' }
        );
        if (error) return { success: false, error: error.message };
        return { success: true, error: null };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    mahberService.submitAttendance(gatheringId, userId, status, reason, note);
    return { success: true, error: null };
  }

  // --- CONTRIBUTIONS & PAYMENTS ---
  async getMemberContribution(
    userId: string
  ): Promise<{ data: MemberContribution; error: string | null }> {
    if (isLiveSupabaseConfigured()) {
      try {
        const { data: paymentsData, error } = await supabase
          .from('payments')
          .select('*')
          .eq('user_id', userId)
          .order('payment_date', { ascending: false });

        if (error) {
          return { data: mahberService.getMemberContribution(userId), error: error.message };
        }

        const expected = 500;
        const totalPaid = (paymentsData || []).reduce((acc, p) => acc + Number(p.amount), 0);
        const outstanding = Math.max(0, expected - totalPaid);

        return {
          data: {
            memberId: userId,
            thisMonthExpected: expected,
            thisMonthPaid: totalPaid,
            totalOutstanding: outstanding,
            history: (paymentsData || []).map((p: any) => ({
              id: p.id,
              monthKey: 'meskerem',
              monthNameAm: 'መስከረም',
              monthNameEn: 'Meskerem',
              yearEth: '2019',
              expected: 500,
              paid: Number(p.amount),
              status: p.status,
              paidDate: p.payment_date,
              note: p.note,
            })),
          },
          error: null,
        };
      } catch (err: any) {
        return { data: mahberService.getMemberContribution(userId), error: err.message };
      }
    }

    return { data: mahberService.getMemberContribution(userId), error: null };
  }

  async recordPayment(
    memberId: string,
    periodId: string,
    amount: number,
    paymentDate: string,
    note?: string
  ): Promise<{ data: PaymentEntry | null; error: string | null }> {
    if (isLiveSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('payments')
          .insert({
            user_id: memberId,
            contribution_period_id: periodId,
            amount,
            payment_date: paymentDate || new Date().toISOString().split('T')[0],
            status: amount >= 500 ? 'paid' : amount > 0 ? 'partial' : 'unpaid',
            note,
          })
          .select()
          .single();

        if (error) return { data: null, error: error.message };
        return { data, error: null };
      } catch (err: any) {
        return { data: null, error: err.message };
      }
    }

    const recorded = mahberService.recordPayment(memberId, periodId, amount, paymentDate, note);
    return { data: recorded, error: null };
  }

  // --- MEZMURS ---
  async getMezmurs(): Promise<{ data: Mezmur[]; error: string | null }> {
    return { data: mahberService.getMezmurs(), error: null };
  }

  async getSuggestions(): Promise<{ data: any[]; error: string | null }> {
    return { data: mahberService.getSuggestions(), error: null };
  }

  async submitSuggestion(
    userId: string,
    userName: string,
    userAmharicName: string,
    titleAm: string,
    title?: string,
    note?: string
  ): Promise<{ data: any; error: string | null }> {
    const sug = mahberService.submitSuggestion(
      userId,
      userName,
      userAmharicName,
      titleAm,
      title,
      note
    );
    return { data: sug, error: null };
  }

  async reviewSuggestion(
    suggestionId: string,
    reviewerId: string,
    decision: 'approved' | 'rejected'
  ): Promise<{ error: string | null }> {
    mahberService.reviewSuggestion(suggestionId, reviewerId, decision);
    return { error: null };
  }

  async startStudy(userId: string, mezmurId: string, notes?: string): Promise<{ data: any; error: string | null }> {
    const study = mahberService.startStudy(userId, mezmurId, notes);
    return { data: study, error: null };
  }

  async recordPractice(
    userId: string,
    studyId: string,
    note?: string,
    durationMinutes?: number
  ): Promise<{ success: boolean; data?: any; error: string | null }> {
    const res = mahberService.recordPractice(userId, studyId, note, durationMinutes);
    return { success: res.success, data: res.practice, error: res.error || null };
  }
}

export const mahberDataService = new MahberDataService();
