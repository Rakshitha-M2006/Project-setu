import { prisma } from "../config/database";
import {
  SCHEME_REGISTRY,
  SchemeDefinition,
  getSchemeBySlug,
  searchSchemes,
  evaluateSchemeEligibility,
  SCHEME_CATEGORIES,
} from "../config/schemeRegistry";

export class SchemeService {
  /**
   * List all government schemes with filtering and search
   */
  async getSchemes(params: {
    query?: string;
    category?: string;
    state?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ schemes: SchemeDefinition[]; totalCount: number; categories: string[] }> {
    const list = searchSchemes(params.query, params.category, params.state);
    const limit = params.limit || 50;
    const offset = params.offset || 0;
    const paginated = list.slice(offset, offset + limit);

    return {
      schemes: paginated,
      totalCount: list.length,
      categories: SCHEME_CATEGORIES,
    };
  }

  /**
   * Get scheme by slug or code
   */
  async getSchemeDetails(slugOrCode: string): Promise<SchemeDefinition | null> {
    const scheme = getSchemeBySlug(slugOrCode);
    return scheme || null;
  }

  /**
   * Interactive preliminary eligibility evaluation
   */
  async checkEligibility(
    slugOrCode: string,
    userData: {
      age?: number;
      occupation?: string;
      annualIncome?: number;
      gender?: string;
      state?: string;
      bplStatus?: boolean;
      hasPuccaHouse?: boolean;
      hasCultivableLand?: boolean;
      isStudent?: boolean;
    }
  ) {
    const scheme = getSchemeBySlug(slugOrCode);
    if (!scheme) {
      throw new Error("Government scheme not found");
    }

    return evaluateSchemeEligibility(scheme, userData);
  }
}

export const schemeService = new SchemeService();
