<?php
    class FloodControlService {
        private const URL = "https://raw.githubusercontent.com/bettergovph/bettergov/refs/heads/main/src/data/flood_control/flood_control.json";
        
        // Fetches raw data from URL
        private function fetchData(): array {
            $ch = curl_init(self::URL);

            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

            $response = curl_exec($ch);

            if ($response === false) {
                curl_close($ch);
                return [];
            }

            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode != 200) {
                return [];
            }

            $data = json_decode($response, true);
            return $data["features"] ?? [];
        }

        // Filters raw data attributes to only include specific set of attributes
        private function filterProjectFields(array $project): array {
            $allowed = [
                'Region',
                'Province',
                'Municipality',
                'ProjectComponentDescription',
                'Longitude',
                'Latitude',
                'ContractCost',
                'Contractor', 
                'StartDate',
                'CompletionDateActual',
                'LegislativeDistrict'
            ];
            
            $filteredAttributes = [];
            foreach ($allowed as $field) {
                $filteredAttributes[$field] = $project['attributes'][$field] ?? 'N/A';
            }
            
            return $filteredAttributes;
        }

        // Searches for FC projects matching specific field value
        // $field - The attribute field to filter by (e.g., 'Region', 'Province')
        // $value - The value to filter by (e.g., "Region I", "Pangasinan")
        public function getProjectsByField(string $field, string $value): array {
            $projects = $this->fetchData();
            $results = [];

            $normalizedValue = strtolower(trim((string)$value));

            foreach ($projects as $proj) {
                $attrValue = strtolower(trim((string)($proj["attributes"][$field] ?? '')));

                if (str_contains($attrValue, $normalizedValue)) {
                    $results[] = $this->filterProjectFields($proj);
                }
            }
            return $results;
        }
    }
?>