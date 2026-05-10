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

  const data = {
    counts: {
      mou: mou.total,
      mobility_project: mobility.total,
      travel: travel.total,
      scholarship: scholarships.total,
      event: events.total
    },
    participants: {
      mobility: sumV2AggregateNestedNumber_(mobility.data || [], ['aggregate_counts', 'participant_count_actual']),
      travel: sumV2AggregateNestedNumber_(travel.data || [], ['participant_summary', 'total']),
      total: 0
    },
    public_visible: {
      mou: countV2AggregateTruthy_(mou.data || [], 'public_visible'),
      mobility_project: countV2AggregateTruthy_(mobility.data || [], 'public_visible'),
      travel: countV2AggregateTruthy_(travel.data || [], 'public_visible'),
      scholarship: countV2AggregateTruthy_(scholarships.data || [], 'public_visible'),
      event: countV2AggregateTruthy_(events.data || [], 'public_visible')
    },
    by_status: {
      mou: countV2AggregateByField_(mou.data || [], 'status'),
      mobility_project: countV2AggregateByField_(mobility.data || [], 'status'),
      travel: countV2AggregateByField_(travel.data || [], 'status'),
      scholarship: countV2AggregateByField_(scholarships.data || [], 'status'),
      event: countV2AggregateByField_(events.data || [], 'status')
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
    mou: filterV2AggregateByFiscalYear_(mou.data || [], year),
    mobility_project: filterV2AggregateByFiscalYear_(mobility.data || [], year),
    travel: filterV2AggregateByFiscalYear_(travel.data || [], year),
    scholarship: filterV2AggregateByFiscalYear_(scholarships.data || [], year),
    event: filterV2AggregateByFiscalYear_(events.data || [], year)
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
      mobility_project: countV2AggregateByField_(filtered.mobility_project, 'status'),
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
