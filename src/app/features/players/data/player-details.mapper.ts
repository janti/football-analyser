import { ApiPlayerDetailsItem } from '../../../core/api/api-football.types';
import { PlayerDetailsVm, PlayerStatGroupVm } from './player-details.models';

function addStat(group: PlayerStatGroupVm, label: string, value?: string | number | null): void {
  if (value !== undefined && value !== null && value !== '') {
    group.items.push({ label, value });
  }
}

export function mapPlayerDetails(item: ApiPlayerDetailsItem): PlayerDetailsVm {
  const stat = item.statistics?.[0];
  const performance: PlayerStatGroupVm = { title: 'Performance', items: [] };
  const attacking: PlayerStatGroupVm = { title: 'Attacking', items: [] };
  const passing: PlayerStatGroupVm = { title: 'Passing', items: [] };
  const defending: PlayerStatGroupVm = { title: 'Defending', items: [] };
  const duelsAndDribbles: PlayerStatGroupVm = { title: 'Duels & Dribbles', items: [] };
  const penalties: PlayerStatGroupVm = { title: 'Penalties', items: [] };
  const discipline: PlayerStatGroupVm = { title: 'Discipline', items: [] };

  addStat(performance, 'Ottelut', stat?.games?.appearences);
  addStat(performance, 'Minuutit', stat?.games?.minutes);
  addStat(performance, 'Arvosana', stat?.games?.rating);
  addStat(performance, 'Avauskokoonpanossa', stat?.games?.lineups);
  addStat(attacking, 'Maalit', stat?.goals?.total);
  addStat(attacking, 'Syotot', stat?.goals?.assists);
  addStat(attacking, 'Laukaukset', stat?.shots?.total);
  addStat(attacking, 'Laukaukset kohti', stat?.shots?.on);
  addStat(passing, 'Syotot', stat?.passes?.total);
  addStat(passing, 'Avainsyotot', stat?.passes?.key);
  addStat(passing, 'Syottotarkkuus', stat?.passes?.accuracy);
  addStat(defending, 'Taklaukset', stat?.tackles?.total);
  addStat(defending, 'Katkot', stat?.tackles?.interceptions);
  addStat(defending, 'Blokit', stat?.tackles?.blocks);
  addStat(duelsAndDribbles, 'Kaksinkamppailut', stat?.duels?.total);
  addStat(duelsAndDribbles, 'Kaksinkamppailut voitettu', stat?.duels?.won);
  addStat(duelsAndDribbles, 'Harhautukset', stat?.dribbles?.attempts);
  addStat(duelsAndDribbles, 'Harhautukset onnistuneet', stat?.dribbles?.success);
  addStat(duelsAndDribbles, 'Ohitettu', stat?.dribbles?.past);
  addStat(penalties, 'Rangaistuspotkut tehty', stat?.penalty?.scored);
  addStat(penalties, 'Rangaistuspotkut ohi', stat?.penalty?.missed);
  addStat(penalties, 'Rankkarit hankittu', stat?.penalty?.won);
  addStat(penalties, 'Rankkarit aiheutettu', stat?.penalty?.committed);
  addStat(penalties, 'Rankkarit torjuttu', stat?.penalty?.saved);
  addStat(discipline, 'Keltaiset', stat?.cards?.yellow);
  addStat(discipline, 'Punaiset', stat?.cards?.red);
  addStat(discipline, 'Rikkeet tehty', stat?.fouls?.committed);
  addStat(discipline, 'Rikkeet hankittu', stat?.fouls?.drawn);

  return {
    id: item.player.id,
    name: item.player.name,
    photo: item.player.photo,
    age: item.player.age,
    nationality: item.player.nationality,
    birthCountry: item.player.birth?.country,
    height: item.player.height,
    weight: item.player.weight,
    position: stat?.games?.position,
    currentTeam: stat?.team
      ? {
          id: stat.team.id,
          name: stat.team.name,
          logo: stat.team.logo
        }
      : undefined,
    statGroups: [performance, attacking, passing, defending, duelsAndDribbles, penalties, discipline].filter(
      (g) => g.items.length > 0
    )
  };
}
