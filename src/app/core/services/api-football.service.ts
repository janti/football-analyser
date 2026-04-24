import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  ApiFixtureDetailsItem,
  ApiFixtureEventItem,
  ApiFixtureResponseItem,
  ApiFixtureLineupItem,
  ApiFixtureStatisticsItem,
  ApiFootballResponse,
  ApiPlayerDetailsItem,
  ApiPlayerSearchItem,
  ApiStandingsResponseItem,
  ApiTeamDetailsItem,
  ApiTeamSquadItem,
  ApiTeamSearchItem
} from '../api/api-football.types';
import { APP_ENVIRONMENT } from '../config/app-environment';
import { withRetryBackoff } from './http-helpers';

@Injectable({ providedIn: 'root' })
export class ApiFootballService {
  private readonly http = inject(HttpClient);
  private readonly env = inject(APP_ENVIRONMENT);

  getFixturesByDateAndLeague(date: string, leagueId: number): Observable<ApiFootballResponse<ApiFixtureResponseItem[]>> {
    const season = this.resolveSeason(date);
    const params = new HttpParams().set('date', date).set('league', leagueId).set('season', season);
    return this.get<ApiFootballResponse<ApiFixtureResponseItem[]>>('/fixtures', params);
  }

  getFixtureDetails(fixtureId: number): Observable<ApiFootballResponse<ApiFixtureDetailsItem[]>> {
    const params = new HttpParams().set('id', fixtureId);
    return this.get<ApiFootballResponse<ApiFixtureDetailsItem[]>>('/fixtures', params);
  }

  getFixtureLineups(fixtureId: number): Observable<ApiFootballResponse<ApiFixtureLineupItem[]>> {
    const params = new HttpParams().set('fixture', fixtureId);
    return this.get<ApiFootballResponse<ApiFixtureLineupItem[]>>('/fixtures/lineups', params);
  }

  getFixtureEvents(fixtureId: number): Observable<ApiFootballResponse<ApiFixtureEventItem[]>> {
    const params = new HttpParams().set('fixture', fixtureId);
    return this.get<ApiFootballResponse<ApiFixtureEventItem[]>>('/fixtures/events', params);
  }

  getFixtureStatistics(fixtureId: number): Observable<ApiFootballResponse<ApiFixtureStatisticsItem[]>> {
    const params = new HttpParams().set('fixture', fixtureId);
    return this.get<ApiFootballResponse<ApiFixtureStatisticsItem[]>>('/fixtures/statistics', params);
  }

  searchTeams(query: string): Observable<ApiFootballResponse<ApiTeamSearchItem[]>> {
    const params = new HttpParams().set('search', query);
    return this.get<ApiFootballResponse<ApiTeamSearchItem[]>>('/teams', params);
  }

  searchPlayers(query: string): Observable<ApiFootballResponse<ApiPlayerSearchItem[]>> {
    const params = new HttpParams().set('search', query);
    return this.get<ApiFootballResponse<ApiPlayerSearchItem[]>>('/players/profiles', params);
  }

  searchPlayersByLeague(
    query: string,
    leagueId: number,
    season: number
  ): Observable<ApiFootballResponse<ApiPlayerDetailsItem[]>> {
    const params = new HttpParams().set('search', query).set('league', leagueId).set('season', season);
    return this.get<ApiFootballResponse<ApiPlayerDetailsItem[]>>('/players', params);
  }

  getFixturesByTeam(teamId: number, next = 10): Observable<ApiFootballResponse<ApiFixtureResponseItem[]>> {
    const params = new HttpParams().set('team', teamId).set('next', next);
    return this.get<ApiFootballResponse<ApiFixtureResponseItem[]>>('/fixtures', params);
  }

  getLastFixturesByTeam(teamId: number, last = 10): Observable<ApiFootballResponse<ApiFixtureResponseItem[]>> {
    const params = new HttpParams().set('team', teamId).set('last', last);
    return this.get<ApiFootballResponse<ApiFixtureResponseItem[]>>('/fixtures', params);
  }

  getPlayerDetails(playerId: number, season: number): Observable<ApiFootballResponse<ApiPlayerDetailsItem[]>> {
    const params = new HttpParams().set('id', playerId).set('season', season);
    return this.get<ApiFootballResponse<ApiPlayerDetailsItem[]>>('/players', params);
  }

  getTeamDetails(teamId: number): Observable<ApiFootballResponse<ApiTeamDetailsItem[]>> {
    const params = new HttpParams().set('id', teamId);
    return this.get<ApiFootballResponse<ApiTeamDetailsItem[]>>('/teams', params);
  }

  getTeamSquad(teamId: number): Observable<ApiFootballResponse<ApiTeamSquadItem[]>> {
    const params = new HttpParams().set('team', teamId);
    return this.get<ApiFootballResponse<ApiTeamSquadItem[]>>('/players/squads', params);
  }

  getStandingsByLeague(leagueId: number, season: number): Observable<ApiFootballResponse<ApiStandingsResponseItem[]>> {
    const params = new HttpParams().set('league', leagueId).set('season', season);
    return this.get<ApiFootballResponse<ApiStandingsResponseItem[]>>('/standings', params);
  }

  private resolveSeason(dateIso: string): number {
    const date = new Date(dateIso);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return month >= 7 ? year : year - 1;
  }

  private get<T>(path: string, params: HttpParams): Observable<T> {
    return this.http.get<T>(`${this.env.apiFootballBaseUrl}${path}`, { params }).pipe(withRetryBackoff(1, 600));
  }
}
