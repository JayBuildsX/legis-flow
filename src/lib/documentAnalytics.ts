export interface DocumentView {
  id: string;
  documentId: string;
  userId: string;
  userName: string;
  viewedAt: Date;
  duration: number; // in seconds
  ipAddress?: string;
  userAgent?: string;
  source: 'web' | 'mobile' | 'api' | 'email';
  metadata?: Record<string, any>;
}

export interface DocumentEdit {
  id: string;
  documentId: string;
  userId: string;
  userName: string;
  editedAt: Date;
  changeType: 'content' | 'metadata' | 'permissions' | 'workflow' | 'signature';
  changesCount: number;
  charactersAdded: number;
  charactersRemoved: number;
  sectionAffected?: string;
  comment?: string;
  version: number;
}

export interface UserEngagement {
  userId: string;
  userName: string;
  totalViews: number;
  totalEdits: number;
  totalTimeSpent: number; // in seconds
  firstAccess: Date;
  lastAccess: Date;
  averageSessionDuration: number;
  engagement: 'low' | 'medium' | 'high';
  role: string;
  department?: string;
}

export interface DocumentAnalytics {
  documentId: string;
  documentTitle: string;
  totalViews: number;
  uniqueViewers: number;
  totalEdits: number;
  uniqueEditors: number;
  totalTimeSpent: number;
  averageViewDuration: number;
  createdAt: Date;
  lastModified: Date;
  currentVersion: number;
  popularity: 'low' | 'medium' | 'high' | 'trending';
  collaborationIndex: number; // 0-100
  contentStability: number; // 0-100
  viewTrend: 'increasing' | 'decreasing' | 'stable';
  editTrend: 'increasing' | 'decreasing' | 'stable';
}

export interface TimeSeriesData {
  date: string;
  views: number;
  edits: number;
  uniqueUsers: number;
  timeSpent: number;
}

export interface AnalyticsReport {
  documentAnalytics: DocumentAnalytics;
  timeSeriesData: TimeSeriesData[];
  userEngagement: UserEngagement[];
  topViewers: UserEngagement[];
  topEditors: UserEngagement[];
  recentActivity: (DocumentView | DocumentEdit)[];
  insights: AnalyticsInsight[];
}

export interface AnalyticsInsight {
  type: 'peak_usage' | 'collaboration_pattern' | 'content_evolution' | 'user_behavior' | 'performance';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'success' | 'error';
  actionable: boolean;
  recommendation?: string;
  data?: any;
}

export interface AnalyticsFilter {
  dateRange?: {
    start: Date;
    end: Date;
  };
  userIds?: string[];
  departments?: string[];
  roles?: string[];
  sources?: string[];
  changeTypes?: string[];
}

/**
 * Document Analytics Service
 * Handles tracking, analysis, and reporting of document usage and engagement
 */
export class DocumentAnalyticsService {
  private static readonly STORAGE_KEY = 'legis_flow_analytics';
  private static views: DocumentView[] = [];
  private static edits: DocumentEdit[] = [];

  /**
   * Track a document view
   */
  static async trackView(
    documentId: string,
    userId: string,
    userName: string,
    source: 'web' | 'mobile' | 'api' | 'email' = 'web',
    metadata?: Record<string, any>
  ): Promise<string> {
    try {
      const view: DocumentView = {
        id: crypto.randomUUID(),
        documentId,
        userId,
        userName,
        viewedAt: new Date(),
        duration: 0, // Will be updated when view ends
        source,
        metadata,
        ipAddress: await this.getClientIP(),
        userAgent: navigator.userAgent
      };

      // Store view start
      this.views.push(view);
      await this.persistAnalytics();

      console.log(`[ANALYTICS] Tracked view: ${view.id} for document ${documentId}`);
      return view.id;

    } catch (error) {
      console.error('[ANALYTICS] Error tracking view:', error);
      throw error;
    }
  }

  /**
   * Update view duration when user leaves
   */
  static async updateViewDuration(viewId: string, duration: number): Promise<void> {
    try {
      const view = this.views.find(v => v.id === viewId);
      if (view) {
        view.duration = duration;
        await this.persistAnalytics();
      }
    } catch (error) {
      console.error('[ANALYTICS] Error updating view duration:', error);
    }
  }

  /**
   * Track a document edit
   */
  static async trackEdit(
    documentId: string,
    userId: string,
    userName: string,
    changeType: 'content' | 'metadata' | 'permissions' | 'workflow' | 'signature',
    changesCount: number,
    charactersAdded: number = 0,
    charactersRemoved: number = 0,
    version: number = 1,
    sectionAffected?: string,
    comment?: string
  ): Promise<string> {
    try {
      const edit: DocumentEdit = {
        id: crypto.randomUUID(),
        documentId,
        userId,
        userName,
        editedAt: new Date(),
        changeType,
        changesCount,
        charactersAdded,
        charactersRemoved,
        version,
        sectionAffected,
        comment
      };

      this.edits.push(edit);
      await this.persistAnalytics();

      console.log(`[ANALYTICS] Tracked edit: ${edit.id} for document ${documentId}`);
      return edit.id;

    } catch (error) {
      console.error('[ANALYTICS] Error tracking edit:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive analytics report for a document
   */
  static async generateAnalyticsReport(
    documentId: string,
    filter?: AnalyticsFilter
  ): Promise<AnalyticsReport> {
    try {
      // Filter data based on criteria
      const filteredViews = this.filterViews(documentId, filter);
      const filteredEdits = this.filterEdits(documentId, filter);

      // Calculate document analytics
      const documentAnalytics = this.calculateDocumentAnalytics(
        documentId,
        filteredViews,
        filteredEdits
      );

      // Generate time series data
      const timeSeriesData = this.generateTimeSeriesData(
        filteredViews,
        filteredEdits,
        filter?.dateRange
      );

      // Calculate user engagement
      const userEngagement = this.calculateUserEngagement(
        filteredViews,
        filteredEdits
      );

      // Get top users
      const topViewers = userEngagement
        .sort((a, b) => b.totalViews - a.totalViews)
        .slice(0, 10);

      const topEditors = userEngagement
        .sort((a, b) => b.totalEdits - a.totalEdits)
        .slice(0, 10);

      // Get recent activity
      const recentActivity = this.getRecentActivity(
        filteredViews,
        filteredEdits
      );

      // Generate insights
      const insights = this.generateInsights(
        documentAnalytics,
        timeSeriesData,
        userEngagement
      );

      return {
        documentAnalytics,
        timeSeriesData,
        userEngagement,
        topViewers,
        topEditors,
        recentActivity,
        insights
      };

    } catch (error) {
      console.error('[ANALYTICS] Error generating report:', error);
      throw error;
    }
  }

  /**
   * Get analytics for multiple documents
   */
  static async getDocumentsAnalytics(
    documentIds: string[],
    filter?: AnalyticsFilter
  ): Promise<DocumentAnalytics[]> {
    try {
      const analytics: DocumentAnalytics[] = [];

      for (const documentId of documentIds) {
        const filteredViews = this.filterViews(documentId, filter);
        const filteredEdits = this.filterEdits(documentId, filter);
        
        const docAnalytics = this.calculateDocumentAnalytics(
          documentId,
          filteredViews,
          filteredEdits
        );
        
        analytics.push(docAnalytics);
      }

      return analytics;

    } catch (error) {
      console.error('[ANALYTICS] Error getting documents analytics:', error);
      throw error;
    }
  }

  /**
   * Get user engagement across all documents
   */
  static async getUserEngagementReport(
    userId?: string,
    filter?: AnalyticsFilter
  ): Promise<UserEngagement[]> {
    try {
      let views = this.views;
      let edits = this.edits;

      // Filter by user if specified
      if (userId) {
        views = views.filter(v => v.userId === userId);
        edits = edits.filter(e => e.userId === userId);
      }

      // Apply other filters
      if (filter?.dateRange) {
        views = views.filter(v => 
          v.viewedAt >= filter.dateRange!.start && 
          v.viewedAt <= filter.dateRange!.end
        );
        edits = edits.filter(e => 
          e.editedAt >= filter.dateRange!.start && 
          e.editedAt <= filter.dateRange!.end
        );
      }

      return this.calculateUserEngagement(views, edits);

    } catch (error) {
      console.error('[ANALYTICS] Error getting user engagement report:', error);
      throw error;
    }
  }

  /**
   * Calculate document analytics
   */
  private static calculateDocumentAnalytics(
    documentId: string,
    views: DocumentView[],
    edits: DocumentEdit[]
  ): DocumentAnalytics {
    const uniqueViewers = new Set(views.map(v => v.userId)).size;
    const uniqueEditors = new Set(edits.map(e => e.userId)).size;
    const totalTimeSpent = views.reduce((sum, v) => sum + v.duration, 0);
    const averageViewDuration = views.length > 0 ? totalTimeSpent / views.length : 0;

    // Calculate trends (simplified - compare with previous period)
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const recentViews = views.filter(v => v.viewedAt >= sevenDaysAgo).length;
    const previousViews = views.filter(v => 
      v.viewedAt >= fourteenDaysAgo && v.viewedAt < sevenDaysAgo
    ).length;

    const recentEdits = edits.filter(e => e.editedAt >= sevenDaysAgo).length;
    const previousEdits = edits.filter(e => 
      e.editedAt >= fourteenDaysAgo && e.editedAt < sevenDaysAgo
    ).length;

    const viewTrend = recentViews > previousViews ? 'increasing' : 
                     recentViews < previousViews ? 'decreasing' : 'stable';
    const editTrend = recentEdits > previousEdits ? 'increasing' : 
                      recentEdits < previousEdits ? 'decreasing' : 'stable';

    // Calculate popularity
    const popularity = views.length > 100 ? 'high' : 
                      views.length > 50 ? 'medium' : 'low';

    // Calculate collaboration index (0-100)
    const collaborationIndex = Math.min(100, 
      (uniqueEditors * 10) + (edits.length * 2) + (uniqueViewers * 1)
    );

    // Calculate content stability (0-100)
    const recentEditRate = recentEdits / Math.max(1, recentViews);
    const contentStability = Math.max(0, 100 - (recentEditRate * 50));

    const currentVersion = edits.length > 0 ? 
      Math.max(...edits.map(e => e.version)) : 1;

    return {
      documentId,
      documentTitle: `Document ${documentId}`, // Would come from database
      totalViews: views.length,
      uniqueViewers,
      totalEdits: edits.length,
      uniqueEditors,
      totalTimeSpent,
      averageViewDuration,
      createdAt: new Date(), // Would come from database
      lastModified: edits.length > 0 ? 
        new Date(Math.max(...edits.map(e => e.editedAt.getTime()))) : 
        new Date(),
      currentVersion,
      popularity: popularity as any,
      collaborationIndex,
      contentStability,
      viewTrend: viewTrend as any,
      editTrend: editTrend as any
    };
  }

  /**
   * Generate time series data
   */
  private static generateTimeSeriesData(
    views: DocumentView[],
    edits: DocumentEdit[],
    dateRange?: { start: Date; end: Date }
  ): TimeSeriesData[] {
    const startDate = dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = dateRange?.end || new Date();
    
    const timeSeriesData: TimeSeriesData[] = [];
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      const dayStart = new Date(date);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const dayViews = views.filter(v => 
        v.viewedAt >= dayStart && v.viewedAt <= dayEnd
      );
      const dayEdits = edits.filter(e => 
        e.editedAt >= dayStart && e.editedAt <= dayEnd
      );

      const uniqueUsers = new Set([
        ...dayViews.map(v => v.userId),
        ...dayEdits.map(e => e.userId)
      ]).size;

      const timeSpent = dayViews.reduce((sum, v) => sum + v.duration, 0);

      timeSeriesData.push({
        date: dateStr,
        views: dayViews.length,
        edits: dayEdits.length,
        uniqueUsers,
        timeSpent
      });
    }

    return timeSeriesData;
  }

  /**
   * Calculate user engagement
   */
  private static calculateUserEngagement(
    views: DocumentView[],
    edits: DocumentEdit[]
  ): UserEngagement[] {
    const userStats = new Map<string, {
      userId: string;
      userName: string;
      views: DocumentView[];
      edits: DocumentEdit[];
    }>();

    // Group by user
    views.forEach(view => {
      if (!userStats.has(view.userId)) {
        userStats.set(view.userId, {
          userId: view.userId,
          userName: view.userName,
          views: [],
          edits: []
        });
      }
      userStats.get(view.userId)!.views.push(view);
    });

    edits.forEach(edit => {
      if (!userStats.has(edit.userId)) {
        userStats.set(edit.userId, {
          userId: edit.userId,
          userName: edit.userName,
          views: [],
          edits: []
        });
      }
      userStats.get(edit.userId)!.edits.push(edit);
    });

    // Calculate engagement metrics
    const engagement: UserEngagement[] = [];

    userStats.forEach(stats => {
      const totalViews = stats.views.length;
      const totalEdits = stats.edits.length;
      const totalTimeSpent = stats.views.reduce((sum, v) => sum + v.duration, 0);
      
      const allActivities = [
        ...stats.views.map(v => v.viewedAt),
        ...stats.edits.map(e => e.editedAt)
      ].sort((a, b) => a.getTime() - b.getTime());

      const firstAccess = allActivities[0] || new Date();
      const lastAccess = allActivities[allActivities.length - 1] || new Date();
      
      const averageSessionDuration = totalViews > 0 ? totalTimeSpent / totalViews : 0;
      
      // Calculate engagement level
      const engagementScore = (totalViews * 1) + (totalEdits * 5) + (totalTimeSpent / 60);
      const engagementLevel = engagementScore > 100 ? 'high' : 
                             engagementScore > 50 ? 'medium' : 'low';

      engagement.push({
        userId: stats.userId,
        userName: stats.userName,
        totalViews,
        totalEdits,
        totalTimeSpent,
        firstAccess,
        lastAccess,
        averageSessionDuration,
        engagement: engagementLevel as any,
        role: 'User', // Would come from user data
        department: 'Legal' // Would come from user data
      });
    });

    return engagement.sort((a, b) => 
      (b.totalViews + b.totalEdits) - (a.totalViews + a.totalEdits)
    );
  }

  /**
   * Get recent activity
   */
  private static getRecentActivity(
    views: DocumentView[],
    edits: DocumentEdit[]
  ): (DocumentView | DocumentEdit)[] {
    const allActivity: (DocumentView | DocumentEdit)[] = [
      ...views,
      ...edits
    ];

    return allActivity
      .sort((a, b) => {
        const dateA = 'viewedAt' in a ? a.viewedAt : a.editedAt;
        const dateB = 'viewedAt' in b ? b.viewedAt : b.editedAt;
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 50);
  }

  /**
   * Generate insights
   */
  private static generateInsights(
    documentAnalytics: DocumentAnalytics,
    timeSeriesData: TimeSeriesData[],
    userEngagement: UserEngagement[]
  ): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = [];

    // Peak usage insight
    const peakDay = timeSeriesData.reduce((max, day) => 
      day.views > max.views ? day : max
    );
    
    if (peakDay.views > 0) {
      insights.push({
        type: 'peak_usage',
        title: 'Peak Usage Day',
        description: `Peak usage occurred on ${peakDay.date} with ${peakDay.views} views`,
        severity: 'info',
        actionable: false
      });
    }

    // Collaboration pattern
    if (documentAnalytics.collaborationIndex > 70) {
      insights.push({
        type: 'collaboration_pattern',
        title: 'High Collaboration',
        description: `This document shows high collaboration with ${documentAnalytics.uniqueEditors} editors`,
        severity: 'success',
        actionable: false
      });
    }

    // Content stability
    if (documentAnalytics.contentStability < 30) {
      insights.push({
        type: 'content_evolution',
        title: 'Unstable Content',
        description: 'Document content is changing frequently, which may indicate ongoing work',
        severity: 'warning',
        actionable: true,
        recommendation: 'Consider implementing version control or review processes'
      });
    }

    // User behavior
    const lowEngagementUsers = userEngagement.filter(u => u.engagement === 'low');
    if (lowEngagementUsers.length > 0) {
      insights.push({
        type: 'user_behavior',
        title: 'Low User Engagement',
        description: `${lowEngagementUsers.length} users show low engagement`,
        severity: 'warning',
        actionable: true,
        recommendation: 'Consider training or process improvements to increase engagement'
      });
    }

    return insights;
  }

  /**
   * Filter views by criteria
   */
  private static filterViews(documentId: string, filter?: AnalyticsFilter): DocumentView[] {
    let views = this.views.filter(v => v.documentId === documentId);

    if (filter?.dateRange) {
      views = views.filter(v => 
        v.viewedAt >= filter.dateRange!.start && 
        v.viewedAt <= filter.dateRange!.end
      );
    }

    if (filter?.userIds) {
      views = views.filter(v => filter.userIds!.includes(v.userId));
    }

    if (filter?.sources) {
      views = views.filter(v => filter.sources!.includes(v.source));
    }

    return views;
  }

  /**
   * Filter edits by criteria
   */
  private static filterEdits(documentId: string, filter?: AnalyticsFilter): DocumentEdit[] {
    let edits = this.edits.filter(e => e.documentId === documentId);

    if (filter?.dateRange) {
      edits = edits.filter(e => 
        e.editedAt >= filter.dateRange!.start && 
        e.editedAt <= filter.dateRange!.end
      );
    }

    if (filter?.userIds) {
      edits = edits.filter(e => filter.userIds!.includes(e.userId));
    }

    if (filter?.changeTypes) {
      edits = edits.filter(e => filter.changeTypes!.includes(e.changeType));
    }

    return edits;
  }

  /**
   * Get client IP address (simplified)
   */
  private static async getClientIP(): Promise<string> {
    try {
      // In a real implementation, this would get the actual client IP
      return '127.0.0.1';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Persist analytics data (simplified - would use database)
   */
  private static async persistAnalytics(): Promise<void> {
    try {
      const data = {
        views: this.views,
        edits: this.edits,
        lastUpdated: new Date()
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('[ANALYTICS] Error persisting analytics:', error);
    }
  }

  /**
   * Load analytics data (simplified - would use database)
   */
  private static async loadAnalytics(): Promise<void> {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        this.views = parsed.views || [];
        this.edits = parsed.edits || [];
      }
    } catch (error) {
      console.error('[ANALYTICS] Error loading analytics:', error);
    }
  }

  /**
   * Initialize analytics service
   */
  static async initialize(): Promise<void> {
    await this.loadAnalytics();
    console.log('[ANALYTICS] Service initialized');
  }
} 