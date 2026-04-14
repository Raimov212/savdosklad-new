package postgres

import (
	"database/sql"
	"fmt"
	"time"

	"savdosklad/internal/entity"
)

type RegionRepo struct {
	db *sql.DB
}

func NewRegionRepo(db *sql.DB) *RegionRepo {
	return &RegionRepo{db: db}
}

// ==================== REGIONS ====================

func (r *RegionRepo) CreateRegion(req entity.CreateRegionRequest) (int, error) {
	var id int
	err := r.db.QueryRow(
		`INSERT INTO regions (name, "createdAt", "updatedAt") VALUES ($1, $2, $3) RETURNING id`,
		req.Name, time.Now(), time.Now(),
	).Scan(&id)
	return id, err
}

func (r *RegionRepo) GetAllRegions() ([]entity.Region, error) {
	rows, err := r.db.Query(`SELECT id, name, "createdAt", "updatedAt" FROM regions ORDER BY name`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var regions []entity.Region
	for rows.Next() {
		var reg entity.Region
		if err := rows.Scan(&reg.ID, &reg.Name, &reg.CreatedAt, &reg.UpdatedAt); err != nil {
			return nil, err
		}
		regions = append(regions, reg)
	}
	return regions, nil
}

func (r *RegionRepo) UpdateRegion(id int, req entity.UpdateRegionRequest) error {
	query := `UPDATE regions SET "updatedAt" = $1`
	args := []interface{}{time.Now()}
	argIdx := 2

	if req.Name != nil {
		query += fmt.Sprintf(`, name = $%d`, argIdx)
		args = append(args, *req.Name)
		argIdx++
	}

	query += fmt.Sprintf(` WHERE id = $%d`, argIdx)
	args = append(args, id)

	_, err := r.db.Exec(query, args...)
	return err
}

func (r *RegionRepo) DeleteRegion(id int) error {
	var count int
	if err := r.db.QueryRow(`SELECT count(*) FROM districts WHERE "regionId" = $1`, id).Scan(&count); err == nil && count > 0 {
		return fmt.Errorf("Viloyatga bog'langan tumanlar mavjudligi sababli o'chirib bo'lmaydi.")
	}

	_, err := r.db.Exec(`DELETE FROM regions WHERE id = $1`, id)
	return err
}

// ==================== DISTRICTS ====================

func (r *RegionRepo) CreateDistrict(req entity.CreateDistrictRequest) (int, error) {
	var id int
	err := r.db.QueryRow(
		`INSERT INTO districts (name, "regionId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4) RETURNING id`,
		req.Name, req.RegionID, time.Now(), time.Now(),
	).Scan(&id)
	return id, err
}

func (r *RegionRepo) GetAllDistricts() ([]entity.District, error) {
	rows, err := r.db.Query(
		`SELECT d.id, d.name, d."regionId", r.name, d."createdAt", d."updatedAt" 
		FROM districts d JOIN regions r ON d."regionId" = r.id ORDER BY r.name, d.name`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var districts []entity.District
	for rows.Next() {
		var d entity.District
		if err := rows.Scan(&d.ID, &d.Name, &d.RegionID, &d.RegionName, &d.CreatedAt, &d.UpdatedAt); err != nil {
			return nil, err
		}
		districts = append(districts, d)
	}
	return districts, nil
}

func (r *RegionRepo) GetDistrictsByRegionID(regionID int) ([]entity.District, error) {
	rows, err := r.db.Query(
		`SELECT d.id, d.name, d."regionId", r.name, d."createdAt", d."updatedAt"
		FROM districts d JOIN regions r ON d."regionId" = r.id WHERE d."regionId" = $1 ORDER BY d.name`, regionID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var districts []entity.District
	for rows.Next() {
		var d entity.District
		if err := rows.Scan(&d.ID, &d.Name, &d.RegionID, &d.RegionName, &d.CreatedAt, &d.UpdatedAt); err != nil {
			return nil, err
		}
		districts = append(districts, d)
	}
	return districts, nil
}

func (r *RegionRepo) UpdateDistrict(id int, req entity.UpdateDistrictRequest) error {
	query := `UPDATE districts SET "updatedAt" = $1`
	args := []interface{}{time.Now()}
	argIdx := 2

	if req.Name != nil {
		query += fmt.Sprintf(`, name = $%d`, argIdx)
		args = append(args, *req.Name)
		argIdx++
	}
	if req.RegionID != nil {
		query += fmt.Sprintf(`, "regionId" = $%d`, argIdx)
		args = append(args, *req.RegionID)
		argIdx++
	}

	query += fmt.Sprintf(` WHERE id = $%d`, argIdx)
	args = append(args, id)

	_, err := r.db.Exec(query, args...)
	return err
}

func (r *RegionRepo) DeleteDistrict(id int) error {
	var count int
	if err := r.db.QueryRow(`SELECT count(*) FROM markets WHERE "districtId" = $1`, id).Scan(&count); err == nil && count > 0 {
		return fmt.Errorf("Tumanga bog'langan bozorlar mavjudligi sababli o'chirib bo'lmaydi.")
	}

	_, err := r.db.Exec(`DELETE FROM districts WHERE id = $1`, id)
	return err
}

// ==================== MARKETS ====================

func (r *RegionRepo) CreateMarket(req entity.CreateMarketRequest) (int, error) {
	var id int
	err := r.db.QueryRow(
		`INSERT INTO markets (name, address, "districtId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5) RETURNING id`,
		req.Name, req.Address, req.DistrictID, time.Now(), time.Now(),
	).Scan(&id)
	return id, err
}

func (r *RegionRepo) GetAllMarkets() ([]entity.Market, error) {
	rows, err := r.db.Query(
		`SELECT m.id, m.name, m.address, m."districtId", d.name, m."createdAt", m."updatedAt"
		FROM markets m JOIN districts d ON m."districtId" = d.id ORDER BY d.name, m.name`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var markets []entity.Market
	for rows.Next() {
		var m entity.Market
		if err := rows.Scan(&m.ID, &m.Name, &m.Address, &m.DistrictID, &m.DistrictName, &m.CreatedAt, &m.UpdatedAt); err != nil {
			return nil, err
		}
		markets = append(markets, m)
	}
	return markets, nil
}

func (r *RegionRepo) GetMarketsByDistrictID(districtID int) ([]entity.Market, error) {
	rows, err := r.db.Query(
		`SELECT m.id, m.name, m.address, m."districtId", d.name, m."createdAt", m."updatedAt"
		FROM markets m JOIN districts d ON m."districtId" = d.id WHERE m."districtId" = $1 ORDER BY m.name`, districtID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var markets []entity.Market
	for rows.Next() {
		var m entity.Market
		if err := rows.Scan(&m.ID, &m.Name, &m.Address, &m.DistrictID, &m.DistrictName, &m.CreatedAt, &m.UpdatedAt); err != nil {
			return nil, err
		}
		markets = append(markets, m)
	}
	return markets, nil
}

func (r *RegionRepo) UpdateMarket(id int, req entity.UpdateMarketRequest) error {
	query := `UPDATE markets SET "updatedAt" = $1`
	args := []interface{}{time.Now()}
	argIdx := 2

	if req.Name != nil {
		query += fmt.Sprintf(`, name = $%d`, argIdx)
		args = append(args, *req.Name)
		argIdx++
	}
	if req.Address != nil {
		query += fmt.Sprintf(`, address = $%d`, argIdx)
		args = append(args, *req.Address)
		argIdx++
	}
	if req.DistrictID != nil {
		query += fmt.Sprintf(`, "districtId" = $%d`, argIdx)
		args = append(args, *req.DistrictID)
		argIdx++
	}

	query += fmt.Sprintf(` WHERE id = $%d`, argIdx)
	args = append(args, id)

	_, err := r.db.Exec(query, args...)
	return err
}

func (r *RegionRepo) DeleteMarket(id int) error {
	_, err := r.db.Exec(`DELETE FROM markets WHERE id = $1`, id)
	return err
}
