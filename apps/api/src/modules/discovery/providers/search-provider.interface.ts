import { SearchQueryDto, SearchSuggestionsQueryDto } from '../dto/search-query.dto'
import { SearchResultDto, SearchSuggestionDto } from '../dto/search-response.dto'

export interface SearchProvider {
  search(query: SearchQueryDto): Promise<{ items: SearchResultDto[]; total: number }>
  suggest(query: SearchSuggestionsQueryDto): Promise<SearchSuggestionDto[]>
}

export const SEARCH_PROVIDER = 'SEARCH_PROVIDER'
