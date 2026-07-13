/**
 * IROUP Database V2.2 aggregate DTO helpers.
 *
 * Admin aggregate routes return structured summaries for dashboard/report
 * planning. They do not return raw sheet rows.
 */

function getV2AdminDashboardSummary_() {
  const mou = listV2AdminMOUs_(false);
  if (!mou.success) return mou;
  const mobility = listV2AdminMobilityProjects_(false);
  if (!mobility.success) return mobility;
  const travel = getV2AdminTravelList_(false);
  if (!travel.success) return travel;
  const scholarships = listV2AdminScholarships_(false);
  if (!scholarships.success) return scholarships;
  const events = listV2AdminEvents_(false);
  if (!events.success) return events;

  const rows = {
    mou: filterV2AggregateValidRows_(mou.data, 'mou_id'),
    mobility_project: filterV2AggregateValidRows_(mobility.data, 'mobility_id'),
    travel: filterV2AggregateValidRows_(travel.data, 'travel_id'),
    scholarship: filterV2AggregateValidRows_(scholarships.data, 'scholarship_id'),
    event: filterV2AggregateValidRows_(events.data, 'event_id')
  };

  const data = {
    counts: {
      mou: rows.mou.length,
      mobility_project: rows.mobility_project.length,
      travel: rows.travel.length,
      scholarship: rows.scholarship.length,
      event: rows.event.length
    },
    participants: {
      mobility: sumV2AggregateNestedNumber_(rows.mobility_project, ['aggregate_counts', 'participant_count_actual']),
      travel: sumV2AggregateNestedNumber_(rows.travel, ['participant_summary', 'total']),
      total: 0
    },
    public_visible: {
      mou: countV2AggregateTruthy_(rows.mou, 'public_visible'),
      mobility_project: countV2AggregateTruthy_(rows.mobility_project, 'public_visible'),
      travel: countV2AggregateTruthy_(rows.travel, 'public_visible'),
      scholarship: countV2AggregateTruthy_(rows.scholarship, 'public_visible'),
      event: countV2AggregateTruthy_(rows.event, 'public_visible')
    },
    by_status: {
      mou: countV2AggregateByField_(rows.mou, 'status'),
      mobility_project: countV2AggregateMobilityStatuses_(rows.mobility_project),
      travel: countV2AggregateByField_(rows.travel, 'status'),
      scholarship: countV2AggregateByField_(rows.scholarship, 'status'),
      event: countV2AggregateByField_(rows.event, 'status')
    }
  };
  data.participants.total = data.participants.mobility + data.participants.travel;

  return adminResponseV2_(true, data, 1, '');
}

function getV2AdminReportSummary_(year) {
  const dashboard = getV2AdminDashboardSummary_();
  if (!dashboard.success) return dashboard;

  const mou = listV2AdminMOUs_(false);
  if (!mou.success) return mou;
  const mobility = listV2AdminMobilityProjects_(false);
  if (!mobility.success) return mobility;
  const travel = getV2AdminTravelList_(false);
  if (!travel.success) return travel;
  const scholarships = listV2AdminScholarships_(false);
  if (!scholarships.success) return scholarships;
  const events = listV2AdminEvents_(false);
  if (!events.success) return events;

  const filtered = {
    mou: filterV2AggregateByFiscalYear_(filterV2AggregateValidRows_(mou.data, 'mou_id'), year),
    mobility_project: filterV2AggregateByFiscalYear_(filterV2AggregateValidRows_(mobility.data, 'mobility_id'), year),
    travel: filterV2AggregateByFiscalYear_(filterV2AggregateValidRows_(travel.data, 'travel_id'), year),
    scholarship: filterV2AggregateByFiscalYear_(filterV2AggregateValidRows_(scholarships.data, 'scholarship_id'), year),
    event: filterV2AggregateByFiscalYear_(filterV2AggregateValidRows_(events.data, 'event_id'), year)
  };

  const data = {
    fiscal_year: year || '',
    dashboard_summary: dashboard.data,
    counts: {
      mou: filtered.mou.length,
      mobility_project: filtered.mobility_project.length,
      travel: filtered.travel.length,
      scholarship: filtered.scholarship.length,
      event: filtered.event.length
    },
    by_status: {
      mou: countV2AggregateByField_(filtered.mou, 'status'),
      mobility_project: countV2AggregateMobilityStatuses_(filtered.mobility_project),
      travel: countV2AggregateByField_(filtered.travel, 'status'),
      scholarship: countV2AggregateByField_(filtered.scholarship, 'status'),
      event: countV2AggregateByField_(filtered.event, 'status')
    },
    participant_counts: {
      mobility: sumV2AggregateNestedNumber_(filtered.mobility_project, ['aggregate_counts', 'participant_count_actual']),
      travel: sumV2AggregateNestedNumber_(filtered.travel, ['participant_summary', 'total'])
    }
  };
  data.participant_counts.total = data.participant_counts.mobility + data.participant_counts.travel;

  return adminResponseV2_(true, data, 1, '');
}

function filterV2AggregateValidRows_(rows, idField) {
  const keyField = String(idField || '').trim();
  if (!keyField) return [];

  return (rows || []).filter(function (row) {
    if (!row) return false;
    if (!String(row[keyField] || '').trim()) return false;
    if (isTruthyV2_(row.is_deleted)) return false;
    return true;
  });
}

function filterV2AggregateByFiscalYear_(rows, year) {
  const normalizedYear = String(year || '').trim();
  if (!normalizedYear) return rows || [];
  return (rows || []).filter(function (row) {
    return String(row.fiscal_year || '').trim() === normalizedYear;
  });
}

function countV2AggregateTruthy_(rows, fieldName) {
  return (rows || []).filter(function (row) {
    return isTruthyV2_(row[fieldName]);
  }).length;
}

function countV2AggregateByField_(rows, fieldName) {
  const counts = {};
  (rows || []).forEach(function (row) {
    const key = String(row[fieldName] || 'unknown').trim() || 'unknown';
    counts[key] = (counts[key] || 0) + 1;
  });
  return counts;
}

function countV2AggregateMobilityStatuses_(rows) {
  const counts = {};
  (rows || []).forEach(function (row) {
    const key = resolveV2MobilityStatus_(row.status, row.end_date) || 'unknown';
    counts[key] = (counts[key] || 0) + 1;
  });
  return counts;
}

function sumV2AggregateNestedNumber_(rows, path) {
  return (rows || []).reduce(function (sum, row) {
    let value = row;
    for (let i = 0; i < path.length; i++) {
      if (!value) return sum;
      value = value[path[i]];
    }
    return sum + toNumberV2_(value);
  }, 0);
}
